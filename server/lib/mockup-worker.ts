import { storage } from "../storage";
import { generateMockup } from "./mockup-engine";
import { uploadMockupBuffer } from "./mockup-storage";
import sharp from "sharp";
import type { MockupJob } from "@shared/schema";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 3;

let isProcessing = false;
let workerInterval: ReturnType<typeof setInterval> | null = null;

sharp.cache(false);
sharp.concurrency(1);

async function recoverStuckJobs(): Promise<void> {
  try {
    const stuckJobs = await storage.getJobsByStatus("processing");
    if (stuckJobs.length > 0) {
      console.log(`[worker] Recovering ${stuckJobs.length} stuck jobs from previous crash`);
      for (const job of stuckJobs) {
        if ((job.attempts ?? 0) >= MAX_ATTEMPTS) {
          await storage.updateJobStatus(job.id, "failed", "Server crashed during processing — max retries reached");
          console.log(`[worker] Job ${job.id} permanently failed (max retries after crash)`);
        } else {
          await storage.updateJobStatus(job.id, "queued", "Server crashed — requeued for retry");
          console.log(`[worker] Job ${job.id} requeued after crash recovery`);
        }
      }
    }
  } catch (err) {
    console.error("[worker] Error recovering stuck jobs:", err);
  }
}

async function processJob(job: MockupJob): Promise<void> {
  if (!job.silhouette || !job.color || !job.variation) {
    throw new Error("Job missing required fields: silhouette, color, variation");
  }

  const presets = await storage.getMockupPresetsBySilhouette(job.silhouette);
  const preset = presets.find(p => p.variation === job.variation);
  const placement = preset?.placement as any || undefined;

  const result = await generateMockup(job.silhouette, job.color, job.variation, placement);

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
    const objectPath = await uploadMockupBuffer(buffer, filename, contentType);
    (result as any)[field] = objectPath;
  }

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

export async function startMockupWorker(): Promise<void> {
  if (workerInterval) return;
  await recoverStuckJobs();
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
