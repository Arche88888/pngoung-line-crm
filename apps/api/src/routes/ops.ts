import type { FastifyInstance } from "fastify";
import type { AnalysisProvider } from "../modules/analysis/provider.js";
import { crmStore } from "../modules/crm/store.js";

export async function registerOpsRoutes(app: FastifyInstance, analysisProvider: AnalysisProvider): Promise<void> {
  app.get("/ops/queue", async () => crmStore.listJobs());
  app.get("/ops/queue/snapshot", async () => crmStore.getQueueSnapshot());
  app.post("/ops/queue/retry-failed", async () => ({
    retried: crmStore.retryFailedJobs()
  }));
  app.get("/ops/provider", async () => analysisProvider.getStatus());
}
