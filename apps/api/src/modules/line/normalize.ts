import type { FastifyRequest } from "fastify";
import type { NormalizedLineEvent } from "../crm/projector.js";

interface LineSource {
  type?: "user" | "group" | "room";
  userId?: string;
  groupId?: string;
  roomId?: string;
}

interface LineMessage {
  id?: string;
  type?: string;
  text?: string;
}

interface LineEvent {
  type?: string;
  timestamp?: number;
  source?: LineSource;
  message?: LineMessage;
}

interface LineWebhookBody {
  events?: LineEvent[];
}

export function readEvents(request: FastifyRequest): LineEvent[] {
  const payload = request.body as LineWebhookBody | undefined;
  return payload?.events ?? [];
}

export function normalizeLineEvent(event: LineEvent): NormalizedLineEvent | null {
  if (event.type !== "message" || !event.message) return null;

  const source = event.source ?? {};
  const roomId = source.groupId ?? source.roomId ?? source.userId ?? `unknown-room-${event.message.id}`;
  const sourceUserId = source.userId ?? `unknown-user-${event.message.id}`;
  const messageType = event.message.type === "text" || event.message.type === "image" || event.message.type === "sticker"
    ? event.message.type
    : "other";
  const text = event.message.text?.trim() || `[${messageType}]`;

  return {
    eventId: event.message.id ?? `${Date.now()}`,
    roomId,
    roomName: source.type === "group" ? `LINE Group ${roomId.slice(0, 6)}` : `LINE ${source.type ?? "chat"} ${roomId.slice(0, 6)}`,
    roomType: source.type ?? "unknown",
    contactId: sourceUserId,
    contactName: `LINE User ${sourceUserId.slice(0, 6)}`,
    sourceUserId,
    messageType,
    text,
    occurredAt: new Date(event.timestamp ?? Date.now()).toISOString()
  };
}
