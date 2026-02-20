import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertContactMessageSchema, SILHOUETTES } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import archiver from "archiver";
import { generateCSV, GENERATED_DIR, BRAND_ASSETS_DIR, DEFAULT_PLACEMENTS, getVariationsForType } from "./lib/mockup-engine";
import { registerObjectStorageRoutes, ObjectStorageService } from "./replit_integrations/object_storage";
import { startMockupWorker } from "./lib/mockup-worker";
import crypto from "crypto";

const UPLOAD_DIR = path.resolve(process.cwd(), "client/public/uploads/brand-assets");

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const tempName = `upload-${Date.now()}${ext}`;
      cb(null, tempName);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".svg", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

function getAdminPassword(): string {
  const pw = process.env.SESSION_SECRET;
  if (!pw) {
    throw new Error("SESSION_SECRET environment variable is required for admin access");
  }
  return pw;
}

function requireAdmin(req: any, res: any, next: any) {
  try {
    const adminPw = getAdminPassword();
    const pw = req.headers["x-admin-password"];
    if (pw !== adminPw) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch {
    return res.status(500).json({ message: "Admin not configured" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  registerObjectStorageRoutes(app);

  startMockupWorker();

  const objStorage = new ObjectStorageService();
  app.get(/^\/storage\/(.+)$/, async (req, res) => {
    try {
      const filePath = req.path.replace("/storage/", "");
      const file = await objStorage.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "Not found" });
      }
      await objStorage.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving storage file:", error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  app.get("/api/drop-settings", async (_req, res) => {
    try {
      let settings = await storage.getDropSettings();
      if (!settings) {
        settings = await storage.upsertDropSettings({
          isLive: false,
          dropDate: null,
          shopifyUrl: null,
        });
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const data = insertLeadSchema.parse(req.body);
      const existing = await storage.getLeadByEmail(data.email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const lead = await storage.createLead(data);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "Invalid data" });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      await storage.createContactMessage(data);
      res.status(200).json({ message: "Message received" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data" });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post("/api/admin/verify", (req, res) => {
    try {
      const adminPw = getAdminPassword();
      const { password } = req.body;
      if (password === adminPw) {
        return res.json({ ok: true });
      }
      res.status(401).json({ message: "Invalid password" });
    } catch {
      res.status(500).json({ message: "Admin not configured" });
    }
  });

  app.get("/api/admin/leads", requireAdmin, async (_req, res) => {
    try {
      const allLeads = await storage.getAllLeads();
      res.json(allLeads);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/admin/leads/export", requireAdmin, async (_req, res) => {
    try {
      const allLeads = await storage.getAllLeads();
      const header = "id,email,whatsapp,source,created_at\n";
      const rows = allLeads.map((l) =>
        `${l.id},"${l.email}","${l.whatsapp || ""}","${l.source}","${l.createdAt.toISOString()}"`
      ).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
      res.send(header + rows);
    } catch (err) {
      res.status(500).json({ message: "Failed to export leads" });
    }
  });

  app.patch("/api/admin/drop-settings", requireAdmin, async (req, res) => {
    try {
      const body = req.body;
      const update: any = {};
      if (body.dropDate !== undefined) update.dropDate = new Date(body.dropDate);
      if (body.isLive !== undefined) update.isLive = body.isLive;
      if (body.shopifyUrl !== undefined) update.shopifyUrl = body.shopifyUrl;
      const settings = await storage.upsertDropSettings(update);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.get("/api/admin/brand-assets", requireAdmin, async (_req, res) => {
    try {
      const assets = await storage.getAllBrandAssets();
      res.json(assets);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch brand assets" });
    }
  });

  app.post("/api/admin/brand-assets", requireAdmin, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { type, name } = req.body;
      if (!type || !name) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ message: "Name and type required" });
      }

      const validTypes = ["wordmark", "icon", "tagline"];
      if (!validTypes.includes(type)) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ message: "Invalid asset type" });
      }

      const sharp = (await import("sharp")).default;
      let meta;
      try {
        meta = await sharp(req.file.path).metadata();
        if (!meta.width || !meta.height) throw new Error("Invalid image");
      } catch {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ message: "Invalid image file" });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const finalFilename = `${type}-${Date.now()}${ext}`;
      const finalPath = path.join(UPLOAD_DIR, finalFilename);
      await fs.rename(req.file.path, finalPath);

      const asset = await storage.createBrandAsset({
        name,
        type,
        filePath: `/uploads/brand-assets/${finalFilename}`,
        width: meta.width || null,
        height: meta.height || null,
      });

      res.status(201).json(asset);
    } catch (err) {
      res.status(500).json({ message: "Failed to upload asset" });
    }
  });

  app.delete("/api/admin/brand-assets/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBrandAsset(id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  app.get("/api/admin/mockup-presets", requireAdmin, async (_req, res) => {
    try {
      const presets = await storage.getAllMockupPresets();

      const defaults: any[] = [];
      for (const sil of SILHOUETTES) {
        const variations = getVariationsForType(sil.type);
        for (const variation of variations) {
          const existing = presets.find(p => p.silhouette === sil.id && p.variation === variation);
          if (existing) {
            defaults.push(existing);
          } else {
            const placement = DEFAULT_PLACEMENTS[sil.type]?.[variation];
            defaults.push({
              id: null,
              silhouette: sil.id,
              variation,
              placement,
              assetType: variation === "bold" || variation === "wordmark" ? "wordmark" : variation === "tagline" ? "tagline" : "icon",
            });
          }
        }
      }

      res.json(defaults);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch presets" });
    }
  });

  app.put("/api/admin/mockup-presets", requireAdmin, async (req, res) => {
    try {
      const { silhouette, variation, placement, assetType } = req.body;
      const preset = await storage.upsertMockupPreset({
        silhouette,
        variation,
        placement,
        assetType,
      });
      res.json(preset);
    } catch (err) {
      res.status(500).json({ message: "Failed to save preset" });
    }
  });

  app.get("/api/mockups", async (_req, res) => {
    try {
      const allMockups = await storage.getAllMockups();
      const approved = allMockups.filter(m => m.approved);
      res.json(approved);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch mockups" });
    }
  });

  app.get("/api/mockups/:silhouette", async (req, res) => {
    try {
      const mockupList = await storage.getMockupsBySilhouette(req.params.silhouette);
      const approved = mockupList.filter(m => m.approved);
      res.json(approved);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch mockups" });
    }
  });

  app.post("/api/admin/mockups/generate", requireAdmin, async (req, res) => {
    try {
      const { silhouette, color, variation } = req.body || {};
      const batchId = crypto.randomUUID();

      if (silhouette && color && variation) {
        const job = await storage.createMockupJob({
          status: "queued",
          silhouette,
          color,
          variation,
          batchId,
          maxAttempts: 3,
        });
        return res.json({ batchId, jobs: [job], message: "Job enqueued" });
      }

      await storage.deleteAllMockups();

      const jobs = [];
      for (const sil of SILHOUETTES) {
        const variations = getVariationsForType(sil.type);
        for (const c of ["black", "white"]) {
          for (const v of variations) {
            const job = await storage.createMockupJob({
              status: "queued",
              silhouette: sil.id,
              color: c,
              variation: v,
              batchId,
              maxAttempts: 3,
            });
            jobs.push(job);
          }
        }
      }

      res.json({ batchId, jobCount: jobs.length, message: `${jobs.length} jobs enqueued` });
    } catch (err: any) {
      console.error("Enqueue error:", err);
      res.status(500).json({ message: err.message || "Failed to enqueue jobs" });
    }
  });

  app.get("/api/admin/mockup-jobs", requireAdmin, async (_req, res) => {
    try {
      const jobs = await storage.getAllMockupJobs();
      const counts = await storage.getJobStatusCounts();
      res.json({ jobs, counts });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/admin/mockup-jobs/status", requireAdmin, async (_req, res) => {
    try {
      const counts = await storage.getJobStatusCounts();
      res.json(counts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch job status" });
    }
  });

  app.get("/api/admin/mockup-jobs/batch/:batchId", requireAdmin, async (req, res) => {
    try {
      const jobs = await storage.getJobsByBatchId(req.params.batchId);
      const counts: Record<string, number> = { queued: 0, processing: 0, completed: 0, failed: 0 };
      for (const j of jobs) {
        counts[j.status] = (counts[j.status] || 0) + 1;
      }
      res.json({ batchId: req.params.batchId, jobs, counts, total: jobs.length });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch batch" });
    }
  });

  app.get("/api/admin/mockup-jobs/:id", requireAdmin, async (req, res) => {
    try {
      const job = await storage.getMockupJob(parseInt(req.params.id));
      if (!job) return res.status(404).json({ message: "Job not found" });
      res.json(job);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.patch("/api/admin/mockups/:id/approve", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approved } = req.body;
      if (typeof approved !== "boolean") {
        return res.status(400).json({ message: "approved must be a boolean" });
      }
      const mockup = await storage.updateMockupApproval(id, approved);
      res.json(mockup);
    } catch (err) {
      res.status(500).json({ message: "Failed to update approval" });
    }
  });

  app.patch("/api/admin/mockups/approve-bulk", requireAdmin, async (req, res) => {
    try {
      const { ids, approved } = req.body;
      if (!Array.isArray(ids) || typeof approved !== "boolean") {
        return res.status(400).json({ message: "ids must be an array and approved must be a boolean" });
      }
      await storage.bulkUpdateMockupApproval(ids, approved);
      res.json({ ok: true, updated: ids.length });
    } catch (err) {
      res.status(500).json({ message: "Failed to bulk update approval" });
    }
  });

  app.get("/api/admin/mockups/approved", requireAdmin, async (_req, res) => {
    try {
      const allMockups = await storage.getAllMockups();
      const approved = allMockups.filter(m => m.approved);
      const unapproved = allMockups.filter(m => !m.approved);
      res.json({ approved, unapproved, totalApproved: approved.length, totalUnapproved: unapproved.length });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch approved mockups" });
    }
  });

  app.get("/api/admin/mockups/export-csv", requireAdmin, async (_req, res) => {
    try {
      const allMockups = await storage.getAllMockups();
      const approvedOnly = allMockups.filter(m => m.approved);
      const csvResults = approvedOnly.map(m => ({
        silhouette: m.silhouette,
        color: m.color,
        variation: m.variation,
        filePath1600: m.filePath1600 || "",
        filePath1024: m.filePath1024 || "",
        filePath640: m.filePath640 || "",
        filePathJpg: m.filePathJpg || "",
        altText: m.altText || "",
        approved: m.approved ? "yes" : "no",
      }));
      const csv = generateCSV(csvResults);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=d21-mockups-manifest.csv");
      res.send(csv);
    } catch (err) {
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  app.get("/api/admin/mockups/export-zip", requireAdmin, async (_req, res) => {
    try {
      const generatedDir = GENERATED_DIR;
      try {
        await fs.access(generatedDir);
      } catch {
        return res.status(404).json({ message: "No generated mockups found" });
      }

      const files = await fs.readdir(generatedDir);
      if (files.length === 0) {
        return res.status(404).json({ message: "No generated mockups found" });
      }

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=d21-mockups.zip");

      const archive = archiver("zip", { zlib: { level: 6 } });
      archive.on("error", (err) => {
        console.error("Archive error:", err);
        if (!res.headersSent) res.status(500).json({ message: "ZIP creation failed" });
      });
      archive.pipe(res);

      for (const file of files) {
        archive.file(path.join(generatedDir, file), { name: file });
      }

      const allMockups = await storage.getAllMockups();
      const csvResults = allMockups.map(m => ({
        silhouette: m.silhouette,
        color: m.color,
        variation: m.variation,
        filePath1600: m.filePath1600 || "",
        filePath1024: m.filePath1024 || "",
        filePath640: m.filePath640 || "",
        filePathJpg: m.filePathJpg || "",
        altText: m.altText || "",
      }));
      archive.append(generateCSV(csvResults), { name: "manifest.csv" });

      await archive.finalize();
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to create ZIP" });
      }
    }
  });

  return httpServer;
}
