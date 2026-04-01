import Fastify from "fastify";
import cors from "@fastify/cors";
import rawBody from "fastify-raw-body";
import { loadConfig } from "./config.js";
import { createAnalysisProvider } from "./modules/analysis/provider.js";
import { startIngestWorker } from "./modules/ingest/worker.js";
import { registerAdvisorRoutes } from "./routes/advisor.js";
import { registerCrmRoutes } from "./routes/crm.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerOpsRoutes } from "./routes/ops.js";
import { registerWebhookRoutes } from "./routes/webhooks.js";

export async function buildApp() {
  const config = loadConfig();
  const analysisProvider = createAnalysisProvider(config);
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
    routes: ["/webhooks/line"]
  });

  await registerHealthRoutes(app);
  await registerCrmRoutes(app);
  await registerAdvisorRoutes(app, analysisProvider);
  await registerOpsRoutes(app, analysisProvider);
  await registerWebhookRoutes(app, {
    lineChannelSecret: config.lineChannelSecret,
    allowUnsignedWebhooks: config.allowUnsignedWebhooks
  });

  startIngestWorker({
    analysisProvider,
    logger: app.log
  });

  return { app, config };
}
