export type ScoreLevel = "green" | "yellow" | "red";

export type PipelineStage =
  | "new"
  | "engaged"
  | "interested"
  | "quoted"
  | "won"
  | "lost"
  | "follow_up";

export interface ScoreCard {
  score: number;
  level: ScoreLevel;
  reason: string;
}

export interface AnalysisResult {
  sentiment: ScoreCard;
  purchaseIntent: ScoreCard;
  tags: string[];
  pipelineStage: PipelineStage;
  summary: string;
}

export interface MessageRecord {
  id: string;
  roomId: string;
  contactId: string;
  source: "line";
  sourceEventId: string;
  messageType: "text" | "image" | "sticker" | "other";
  text: string;
  createdAt: string;
  analysis: AnalysisResult;
}

export interface RoomRecord {
  id: string;
  source: "line";
  sourceType: "user" | "group" | "room" | "unknown";
  name: string;
  messageCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string;
  sentiment: ScoreCard;
  purchaseIntent: ScoreCard;
  pipelineStage: PipelineStage;
  tags: string[];
}

export interface ContactRecord {
  id: string;
  source: "line";
  sourceUserId: string;
  displayName: string;
  roomIds: string[];
  totalMessages: number;
  sentiment: ScoreCard;
  purchaseIntent: ScoreCard;
  pipelineStage: PipelineStage;
  tags: string[];
  lastMessageAt: string | null;
}

export interface DashboardSnapshot {
  rooms: number;
  contacts: number;
  hotLeads: number;
  urgentRooms: number;
  openTasks: number;
  pendingJobs: number;
}

export type TaskPriority = "critical" | "high" | "normal";

export type TaskStatus = "open" | "done";

export interface FollowUpTask {
  id: string;
  roomId: string;
  contactId: string;
  title: string;
  detail: string;
  suggestedAction: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  trigger: "hot_lead" | "service_recovery" | "follow_up";
}

export type AdvisorPriority = "critical" | "warning" | "opportunity" | "info";

export interface AdvisorSuggestion {
  id: string;
  priority: AdvisorPriority;
  title: string;
  detail: string;
  action: string;
  relatedRoomId: string | null;
  source: "rule" | "llm";
}

export interface AdvisorReport {
  id: string;
  provider: string;
  generatedAt: string;
  suggestions: AdvisorSuggestion[];
}

export type IngestJobStatus = "queued" | "processing" | "done" | "failed";

export interface IngestJobRecord {
  id: string;
  sourceEventId: string;
  roomId: string;
  contactId: string;
  messagePreview: string;
  status: IngestJobStatus;
  attempts: number;
  lastError: string | null;
  enqueuedAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface QueueSnapshot {
  queued: number;
  processing: number;
  failed: number;
  done: number;
}

export interface AnalysisProviderStatus {
  provider: string;
  ready: boolean;
  fallbackActive: boolean;
  message: string;
}
