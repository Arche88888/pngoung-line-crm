import type { AnalysisResult, FollowUpTask, MessageRecord } from "@pngoung/shared";
import { crmStore } from "./store.js";

export interface NormalizedLineEvent {
  eventId: string;
  roomId: string;
  roomName: string;
  roomType: "user" | "group" | "room" | "unknown";
  contactId: string;
  contactName: string;
  sourceUserId: string;
  messageType: "text" | "image" | "sticker" | "other";
  text: string;
  occurredAt: string;
}

export function projectLineEvent(event: NormalizedLineEvent, analysis: AnalysisResult): MessageRecord {
  const message: MessageRecord = {
    id: `${event.roomId}:${event.eventId}`,
    roomId: event.roomId,
    contactId: event.contactId,
    source: "line",
    sourceEventId: event.eventId,
    messageType: event.messageType,
    text: event.text,
    createdAt: event.occurredAt,
    analysis
  };

  crmStore.appendMessage(message);

  const room = crmStore.upsertRoom({
    id: event.roomId,
    name: event.roomName,
    sourceType: event.roomType,
    messageCount: crmStore.listMessages(event.roomId).length,
    lastMessageAt: event.occurredAt,
    lastMessagePreview: event.text.slice(0, 120),
    sentiment: analysis.sentiment,
    purchaseIntent: analysis.purchaseIntent,
    pipelineStage: analysis.pipelineStage,
    tags: analysis.tags
  });

  const currentContact = crmStore.listContacts().find((item) => item.id === event.contactId);
  const existingContact = crmStore.upsertContact({
    id: event.contactId,
    displayName: event.contactName,
    sourceUserId: event.sourceUserId,
    roomIds: Array.from(new Set([...(currentContact?.roomIds ?? []), event.roomId])),
    totalMessages: (currentContact?.totalMessages ?? 0) + 1,
    sentiment: analysis.sentiment,
    purchaseIntent: analysis.purchaseIntent,
    pipelineStage: analysis.pipelineStage,
    tags: Array.from(new Set([...(currentContact?.tags ?? []), ...analysis.tags])),
    lastMessageAt: event.occurredAt
  });

  crmStore.upsertRoom({
    id: room.id,
    name: room.name,
    sourceType: room.sourceType,
    messageCount: room.messageCount,
    lastMessageAt: room.lastMessageAt,
    lastMessagePreview: room.lastMessagePreview,
    sentiment: room.sentiment,
    purchaseIntent: room.purchaseIntent,
    pipelineStage: room.pipelineStage,
    tags: Array.from(new Set([...room.tags, ...existingContact.tags]))
  });

  for (const task of inferTasks(event, analysis)) {
    crmStore.upsertTask(task);
  }

  return message;
}

function inferTasks(event: NormalizedLineEvent, analysis: AnalysisResult): FollowUpTask[] {
  const tasks: FollowUpTask[] = [];
  const createdAt = event.occurredAt;

  const offsetDueAt = (hours: number) => {
    return new Date(new Date(createdAt).getTime() + hours * 60 * 60 * 1000).toISOString();
  };

  if (analysis.purchaseIntent.level === "red") {
    tasks.push({
      id: `${event.roomId}:${event.contactId}:hot-lead`,
      roomId: event.roomId,
      contactId: event.contactId,
      title: `\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21 lead \u0E23\u0E49\u0E2D\u0E19: ${event.contactName}`,
      detail: `\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E21\u0E35\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E13\u0E0B\u0E37\u0E49\u0E2D\u0E08\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21 "${event.text.slice(0, 80)}"`,
      suggestedAction: "\u0E2A\u0E48\u0E07\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E17\u0E35\u0E48\u0E15\u0E2D\u0E1A\u0E42\u0E08\u0E17\u0E22\u0E4C \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E0A\u0E27\u0E19\u0E04\u0E38\u0E22\u0E02\u0E31\u0E49\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B",
      priority: "high",
      status: "open",
      createdAt,
      updatedAt: createdAt,
      dueAt: offsetDueAt(2),
      trigger: "hot_lead"
    });
  }

  if (analysis.sentiment.level === "red") {
    tasks.push({
      id: `${event.roomId}:${event.contactId}:service-recovery`,
      roomId: event.roomId,
      contactId: event.contactId,
      title: `\u0E23\u0E35\u0E1A\u0E14\u0E39\u0E41\u0E25\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32: ${event.contactName}`,
      detail: `\u0E1E\u0E1A\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E13\u0E44\u0E21\u0E48\u0E1E\u0E2D\u0E43\u0E08\u0E08\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21 "${event.text.slice(0, 80)}"`,
      suggestedAction: "\u0E15\u0E2D\u0E1A\u0E01\u0E25\u0E31\u0E1A\u0E40\u0E0A\u0E34\u0E07 empathize \u0E41\u0E25\u0E30\u0E40\u0E04\u0E25\u0E35\u0E22\u0E23\u0E4C\u0E1B\u0E23\u0E30\u0E40\u0E14\u0E47\u0E19\u0E17\u0E35\u0E48\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E01\u0E31\u0E07\u0E27\u0E25",
      priority: "critical",
      status: "open",
      createdAt,
      updatedAt: createdAt,
      dueAt: offsetDueAt(1),
      trigger: "service_recovery"
    });
  } else if (analysis.sentiment.level === "yellow" || analysis.tags.includes("\u0E16\u0E32\u0E21\u0E23\u0E32\u0E04\u0E32")) {
    tasks.push({
      id: `${event.roomId}:${event.contactId}:follow-up`,
      roomId: event.roomId,
      contactId: event.contactId,
      title: `\u0E15\u0E32\u0E21\u0E15\u0E48\u0E2D\u0E1A\u0E17\u0E2A\u0E19\u0E17\u0E19\u0E32: ${event.contactName}`,
      detail: `\u0E04\u0E27\u0E23 follow-up \u0E08\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21 "${event.text.slice(0, 80)}"`,
      suggestedAction: "\u0E2A\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E0A\u0E48\u0E27\u0E22\u0E43\u0E2B\u0E49\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08\u0E07\u0E48\u0E32\u0E22\u0E02\u0E36\u0E49\u0E19\u0E41\u0E25\u0E30\u0E16\u0E32\u0E21\u0E15\u0E48\u0E2D\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E40\u0E08\u0E32\u0E30\u0E08\u0E07",
      priority: "normal",
      status: "open",
      createdAt,
      updatedAt: createdAt,
      dueAt: offsetDueAt(8),
      trigger: "follow_up"
    });
  }

  return tasks;
}
