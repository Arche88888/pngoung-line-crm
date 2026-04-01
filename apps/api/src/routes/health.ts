import type { FastifyInstance } from "fastify";
import { crmStore } from "../modules/crm/store.js";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => ({
    status: "ok",
    service: "pngoung-line-crm-api",
    snapshot: crmStore.getSnapshot()
  }));
}
