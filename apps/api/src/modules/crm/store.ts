import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  AdvisorReport,
  ContactRecord,
  DashboardSnapshot,
  FollowUpTask,
  IngestJobRecord,
  MessageRecord,
  QueueSnapshot,
  RoomRecord
} from "@pngoung/shared";
import type { NormalizedLineEvent } from "./projector.js";

const defaultScore = { score: 50, level: "yellow" as const, reason: "No data yet" };

interface PersistedState {
  rooms: RoomRecord[];
  contacts: ContactRecord[];
  messages: MessageRecord[];
  tasks: FollowUpTask[];
  advisorReports: AdvisorReport[];
  jobs: PersistedJob[];
  processedEventIds: string[];
}

interface PersistedJob extends IngestJobRecord {
  payload: NormalizedLineEvent;
}

export class InMemoryCrmStore {
  private readonly rooms = new Map<string, RoomRecord>();
  private readonly contacts = new Map<string, ContactRecord>();
  private readonly messages = new Map<string, MessageRecord[]>();
  private readonly tasks = new Map<string, FollowUpTask>();
  private readonly advisorReports = new Map<string, AdvisorReport>();
  private readonly jobs = new Map<string, PersistedJob>();
  private readonly processedEventIds = new Set<string>();
  private readonly storageFile = path.join(process.cwd(), "data", "crm-store.json");

  constructor() {
    this.hydrate();
  }

  private hydrate(): void {
    if (!existsSync(this.storageFile)) return;
    const raw = readFileSync(this.storageFile, "utf8");
    const state = JSON.parse(raw) as PersistedState;
    for (const room of state.rooms ?? []) this.rooms.set(room.id, room);
    for (const contact of state.contacts ?? []) this.contacts.set(contact.id, contact);
    for (const message of state.messages ?? []) {
      const timeline = this.messages.get(message.roomId) ?? [];
      timeline.push(message);
      this.messages.set(message.roomId, timeline);
    }
    for (const task of state.tasks ?? []) this.tasks.set(task.id, task);
    for (const report of state.advisorReports ?? []) this.advisorReports.set(report.id, report);
    for (const job of state.jobs ?? []) this.jobs.set(job.id, job);
    for (const eventId of state.processedEventIds ?? []) this.processedEventIds.add(eventId);
  }

  private persist(): void {
    mkdirSync(path.dirname(this.storageFile), { recursive: true });
    const payload: PersistedState = {
      rooms: this.listRooms(),
      contacts: this.listContacts(),
      messages: [...this.messages.values()].flat(),
      tasks: this.listTasks(),
      advisorReports: this.listAdvisorReports(),
      jobs: this.listJobsInternal(),
      processedEventIds: [...this.processedEventIds]
    };
    writeFileSync(this.storageFile, JSON.stringify(payload, null, 2));
  }

  upsertRoom(record: Partial<RoomRecord> & Pick<RoomRecord, "id" | "name" | "sourceType">): RoomRecord {
    const current = this.rooms.get(record.id);
    const next: RoomRecord = {
      id: record.id, source: "line", sourceType: record.sourceType, name: record.name,
      messageCount: record.messageCount ?? current?.messageCount ?? 0,
      lastMessageAt: record.lastMessageAt ?? current?.lastMessageAt ?? null,
      lastMessagePreview: record.lastMessagePreview ?? current?.lastMessagePreview ?? "",
      sentiment: record.sentiment ?? current?.sentiment ?? defaultScore,
      purchaseIntent: record.purchaseIntent ?? current?.purchaseIntent ?? defaultScore,
      pipelineStage: record.pipelineStage ?? current?.pipelineStage ?? "new",
      tags: record.tags ?? current?.tags ?? []
    };
    this.rooms.set(next.id, next);
    this.persist();
    return next;
  }

  upsertContact(record: Partial<ContactRecord> & Pick<ContactRecord, "id" | "displayName" | "sourceUserId">): ContactRecord {
    const current = this.contacts.get(record.id);
    const next: ContactRecord = {
      id: record.id, source: "line", sourceUserId: record.sourceUserId, displayName: record.displayName,
      roomIds: record.roomIds ?? current?.roomIds ?? [],
      totalMessages: record.totalMessages ?? current?.totalMessages ?? 0,
      sentiment: record.sentiment ?? current?.sentiment ?? defaultScore,
      purchaseIntent: record.purchaseIntent ?? current?.purchaseIntent ?? defaultScore,
      pipelineStage: record.pipelineStage ?? current?.pipelineStage ?? "new",
      tags: record.tags ?? current?.tags ?? [],
      lastMessageAt: record.lastMessageAt ?? current?.lastMessageAt ?? null
    };
    this.contacts.set(next.id, next);
    this.persist();
    return next;
  }

  appendMessage(record: MessageRecord): void {
    const timeline = this.messages.get(record.roomId) ?? [];
    timeline.push(record);
    this.messages.set(record.roomId, timeline);
    this.persist();
  }

  upsertTask(record: FollowUpTask): FollowUpTask {
    this.tasks.set(record.id, record);
    this.persist();
    return record;
  }

  markTaskDone(taskId: string): FollowUpTask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    const updated: FollowUpTask = { ...task, status: "done", updatedAt: new Date().toISOString() };
    this.tasks.set(taskId, updated);
    this.persist();
    return updated;
  }

  listRooms(): RoomRecord[] {
    return [...this.rooms.values()].sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
  }

  listContacts(): ContactRecord[] {
    return [...this.contacts.values()].sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
  }

  listMessages(roomId: string): MessageRecord[] { return this.messages.get(roomId) ?? []; }
  listTasks(): FollowUpTask[] { return [...this.tasks.values()].sort((a, b) => a.dueAt.localeCompare(b.dueAt)); }
  getRoom(roomId: string): RoomRecord | null { return this.rooms.get(roomId) ?? null; }
  getContact(contactId: string): ContactRecord | null { return this.contacts.get(contactId) ?? null; }
  listTasksByRoom(roomId: string): FollowUpTask[] { return this.listTasks().filter((t) => t.roomId === roomId); }
  listTasksByContact(contactId: string): FollowUpTask[] { return this.listTasks().filter((t) => t.contactId === contactId); }

  enqueueJob(payload: NormalizedLineEvent): IngestJobRecord | null {
    if (this.hasSeenEvent(payload.eventId)) return null;
    const now = new Date().toISOString();
    const job: PersistedJob = {
      id: `job-${payload.eventId}`,
      sourceEventId: payload.eventId,
      roomId: payload.roomId,
      contactId: payload.contactId,
      messagePreview: payload.text.slice(0, 120),
      status: "queued",
      attempts: 0,
      lastError: null,
      enqueuedAt: now,
      updatedAt: now,
      startedAt: null,
      completedAt: null,
      payload
    };
    this.jobs.set(job.id, job);
    this.persist();
    return this.toPublicJob(job);
  }

  hasSeenEvent(sourceEventId: string): boolean {
    if (this.processedEventIds.has(sourceEventId)) return true;
    return this.listJobsInternal().some((job) => job.sourceEventId === sourceEventId);
  }

  getNextQueuedJob(): PersistedJob | null {
    return this.listJobsInternal().find((job) => job.status === "queued") ?? null;
  }

  startJob(jobId: string): PersistedJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    const updated: PersistedJob = {
      ...job, status: "processing", attempts: job.attempts + 1,
      startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastError: null
    };
    this.jobs.set(jobId, updated);
    this.persist();
    return updated;
  }

  completeJob(jobId: string): PersistedJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    const updated: PersistedJob = {
      ...job, status: "done", completedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    this.jobs.set(jobId, updated);
    this.processedEventIds.add(job.sourceEventId);
    this.persist();
    return updated;
  }

  failJob(jobId: string, error: string): PersistedJob | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    const shouldRetry = job.attempts < 3;
    const updated: PersistedJob = {
      ...job, status: shouldRetry ? "queued" : "failed",
      lastError: error.slice(0, 500), updatedAt: new Date().toISOString()
    };
    this.jobs.set(jobId, updated);
    this.persist();
    return updated;
  }

  retryFailedJobs(): number {
    let retried = 0;
    for (const job of this.jobs.values()) {
      if (job.status !== "failed") continue;
      this.jobs.set(job.id, { ...job, status: "queued", lastError: null, updatedAt: new Date().toISOString() });
      retried += 1;
    }
    if (retried > 0) this.persist();
    return retried;
  }

  listJobs(): IngestJobRecord[] { return this.listJobsInternal().map((job) => this.toPublicJob(job)); }

  getQueueSnapshot(): QueueSnapshot {
    const jobs = this.listJobsInternal();
    return {
      queued: jobs.filter((j) => j.status === "queued").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      done: jobs.filter((j) => j.status === "done").length
    };
  }

  addAdvisorReport(report: AdvisorReport): AdvisorReport {
    this.advisorReports.set(report.id, report);
    this.persist();
    return report;
  }

  listAdvisorReports(): AdvisorReport[] {
    return [...this.advisorReports.values()].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }

  getLatestAdvisorReport(): AdvisorReport | null { return this.listAdvisorReports()[0] ?? null; }

  getSnapshot(): DashboardSnapshot {
    const rooms = this.listRooms();
    const contacts = this.listContacts();
    const openTasks = this.listTasks().filter((t) => t.status === "open");
    return {
      rooms: rooms.length,
      contacts: contacts.length,
      hotLeads: contacts.filter((c) => c.purchaseIntent.level === "red").length,
      urgentRooms: rooms.filter((r) => r.sentiment.level === "red").length,
      openTasks: openTasks.length,
      pendingJobs: this.getQueueSnapshot().queued + this.getQueueSnapshot().processing
    };
  }

  private listJobsInternal(): PersistedJob[] {
    return [...this.jobs.values()].sort((a, b) => b.enqueuedAt.localeCompare(a.enqueuedAt));
  }

  private toPublicJob(job: PersistedJob): IngestJobRecord {
    const { payload: _payload, ...publicJob } = job;
    return publicJob;
  }
}

export const crmStore = new InMemoryCrmStore();
