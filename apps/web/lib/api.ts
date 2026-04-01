import type {
  AnalysisProviderStatus,
  AdvisorReport,
  ContactRecord,
  DashboardSnapshot,
  FollowUpTask,
  IngestJobRecord,
  QueueSnapshot,
  RoomRecord
} from "@pngoung/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getSnapshot() {
  return getJson<DashboardSnapshot>("/crm/snapshot");
}

export function getRooms() {
  return getJson<RoomRecord[]>("/crm/rooms");
}

export function getContacts() {
  return getJson<ContactRecord[]>("/crm/contacts");
}

export function getTasks() {
  return getJson<FollowUpTask[]>("/crm/tasks");
}

export function getLatestAdvisorReport() {
  return getJson<AdvisorReport>("/advisor/latest");
}

export function getQueueSnapshot() {
  return getJson<QueueSnapshot>("/ops/queue/snapshot");
}

export function getQueueJobs() {
  return getJson<IngestJobRecord[]>("/ops/queue");
}

export function getProviderStatus() {
  return getJson<AnalysisProviderStatus>("/ops/provider");
}

export function getRoomDetail(roomId: string) {
  return getJson<{
    room: RoomRecord;
    messages: Array<{
      id: string;
      roomId: string;
      contactId: string;
      text: string;
      createdAt: string;
      messageType: string;
      analysis: {
        summary: string;
      };
    }>;
    tasks: FollowUpTask[];
  }>(`/crm/rooms/${encodeURIComponent(roomId)}`);
}

export function getContactDetail(contactId: string) {
  return getJson<{
    contact: ContactRecord;
    tasks: FollowUpTask[];
    rooms: RoomRecord[];
  }>(`/crm/contacts/${encodeURIComponent(contactId)}`);
}
