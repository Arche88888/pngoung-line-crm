import type { FastifyInstance } from "fastify";
import { crmStore } from "../modules/crm/store.js";
import { normalizeLineEvent, readEvents } from "../modules/line/normalize.js";
import { verifyLineSignature } from "../lib/line-signature.js";

interface WebhookRouteOptions {
  lineChannelSecret: string;
  allowUnsignedWebhooks: boolean;
}

export async function registerWebhookRoutes(app: FastifyInstance, options: WebhookRouteOptions): Promise<void> {
  app.post("/webhooks/line", async (request, reply) => {
    const rawBody = typeof request.rawBody === "string" ? request.rawBody : request.rawBody?.toString("utf8") ?? "";
    const signature = request.headers["x-line-signature"] as string | undefined;
    const isVerified = verifyLineSignature(rawBody, signature, options.lineChannelSecret);

    if (!isVerified && !options.allowUnsignedWebhooks) {
      return reply.code(401).send({ error: "invalid signature" });
    }

    const events = readEvents(request);
    const queued = events
      .map((event) => normalizeLineEvent(event))
      .filter((event): event is NonNullable<typeof event> => event !== null)
      .map((event) => crmStore.enqueueJob(event))
      .filter((job): job is NonNullable<typeof job> => job !== null);

    return reply.code(200).send({
      ok: true,
      received: events.length,
      queued: queued.length
    });
  });
}
