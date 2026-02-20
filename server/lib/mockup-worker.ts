import { storage } from "../storage";
import { generateMockup } from "./mockup-engine";
import { uploadMockupBuffer } from "./mockup-storage";
import sharp from "sharp";
import type { MockupJob } from "@shared/schema";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 3;

let isProcessing = false;
let workerInterval: ReturnType<typeof setInterval> | null = null;

async function processJob(job: MockupJob): Promise<void> {
  if (!job.silhouette || !job.color || !job.variation) {
    throw new Error("Job missing required fields: silhouette, color, variation");
  }

  const presets = await storage.getMockupPresetsBySilhouette(job.silhouette);
  const preset = presets.find(p => p.variation === job.variation);
  const placement = preset?.placement as any || undefined;

  const result = await generateMockup(job.silhouette, job.color, job.variation, placement);

  const uploadTasks: Promise<string>[] = [];

  for (const field of ["filePath1600", "filePath1024", "filePath640", "filePathJpg"] as const) {
    const localPath = result[field];
    if (!localPath) continue;

    const filename = localPath.split("/").pop()!;
    const isWebp = filename.endsWith(".webp");
    const contentType = isWebp ? "image/webp" : "image/jpeg";

    const fs = await import("fs/promises");
    const path = await import("path");
    const fullPath = path.resolve(process.cwd(), "client/public", localPath.startsWith("/") ? localPath.slice(1) : localPath);

    const buffer = await fs.readFile(fullPath);
    uploadTasks.push(
      uploadMockupBuffer(buffer, filename, contentType).then(objectPath => {
        (result as any)[field] = objectPath;
        return objectPath;
      })
    );
  }

  await Promise.all(uploadTasks);

  await storage.createMockup({
    silhouette: result.silhouette,
    color: result.color,
    variation: result.variation,
    presetId: preset?.id || null,
    filePath1600: result.filePath1600,
    filePath1024: result.filePath1024,
    filePath640: result.filePath640,
    filePathJpg: result.filePathJpg,
    altText: result.altText,
    approved: false,
    jobId: job.id,
  });
}

async function pollAndProcess(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const job = await storage.getNextQueuedJob();
    if (!job) return;

    await storage.updateJobStatus(job.id, "processing");
    await storage.incrementJobAttempts(job.id);

    try {
      await processJob(job);
      await storage.updateJobStatus(job.id, "completed", null);
      console.log(`[worker] Job ${job.id} completed: ${job.silhouette}-${job.color}-${job.variation}`);
    } catch (err: any) {
      const errorMsg = err?.message || "Unknown error";
      console.error(`[worker] Job ${job.id} failed (attempt ${job.attempts + 1}):`, errorMsg);

      const updatedJob = await storage.getMockupJob(job.id);
      const attempts = updatedJob?.attempts ?? job.attempts + 1;

      if (attempts >= MAX_ATTEMPTS) {
        await storage.updateJobStatus(job.id, "failed", errorMsg);
        console.error(`[worker] Job ${job.id} permanently failed after ${attempts} attempts`);
      } else {
        await storage.updateJobStatus(job.id, "queued", errorMsg);
        console.log(`[worker] Job ${job.id} requeued for retry (attempt ${attempts}/${MAX_ATTEMPTS})`);
      }
    }
  } catch (err) {
    console.error("[worker] Poll error:", err);
  } finally {
    isProcessing = false;
  }
}

export function startMockupWorker(): void {
  if (workerInterval) return;
  console.log("[worker] Mockup background worker started");
  workerInterval = setInterval(pollAndProcess, POLL_INTERVAL_MS);
}

export function stopMockupWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log("[worker] Mockup background worker stopped");
  }
}
