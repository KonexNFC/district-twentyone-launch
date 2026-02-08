import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";

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

  return httpServer;
}
