import type { FastifyBaseLogger } from "fastify";
import type { AnalysisProvider } from "../analysis/provider.js";
import { projectLineEvent } from "../crm/projector.js";
import { crmStore } from "../crm/store.js";

interface WorkerOptions {
  analysisProvider: AnalysisProvider;
  logger: FastifyBaseLogger;
  intervalMs?: number;
}

export function startIngestWorker(options: WorkerOptions): void {
  const intervalMs = options.intervalMs ?? 750;
  let processing = false;

  const tick = async () => {
    if (processing) return;

    const nextJob = crmStore.getNextQueuedJob();
    if (!nextJob) return;

    processing = true;
    const activeJob = crmStore.startJob(nextJob.id);
    if (!activeJob) {
      processing = false;
      return;
    }

    try {
      const analysis = await options.analysisProvider.analyzeText(activeJob.payload.text);
      projectLineEvent(activeJob.payload, analysis);
      crmStore.completeJob(activeJob.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      options.logger.error({ err: error, jobId: activeJob.id }, "Ingest worker failed");
      crmStore.failJob(activeJob.id, message);
    } finally {
      processing = false;
    }
  };

  setInterval(() => {
    void tick();
  }, intervalMs);

  options.logger.info({ intervalMs }, "Ingest worker started");
}
