import type { FastifyInstance } from "fastify";
import type { AnalysisProvider } from "../modules/analysis/provider.js";
import { generateAdvisorReport } from "../modules/advisor/service.js";
import { crmStore } from "../modules/crm/store.js";

export async function registerAdvisorRoutes(app: FastifyInstance, provider: AnalysisProvider): Promise<void> {
  app.get("/advisor/latest", async () => {
    const existing = crmStore.getLatestAdvisorReport();
    if (existing) return existing;
    return generateAdvisorReport(provider);
  });

  app.get("/advisor/reports", async () => crmStore.listAdvisorReports());

  app.post("/advisor/generate", async () => generateAdvisorReport(provider));
}
