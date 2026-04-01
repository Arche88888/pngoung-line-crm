"use server";

import { revalidatePath } from "next/cache";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function postJson(path: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
}

function formValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function markTaskDoneAction(formData: FormData): Promise<void> {
  const taskId = formValue(formData, "taskId");
  const roomId = formValue(formData, "roomId");
  const contactId = formValue(formData, "contactId");

  if (!taskId) {
    throw new Error("taskId is required");
  }

  await postJson(`/crm/tasks/${encodeURIComponent(taskId)}/done`);

  revalidatePath("/");
  revalidatePath("/tasks");
  if (roomId) {
    revalidatePath(`/rooms/${encodeURIComponent(roomId)}`);
  }
  if (contactId) {
    revalidatePath(`/contacts/${encodeURIComponent(contactId)}`);
  }
}

export async function generateAdvisorAction(): Promise<void> {
  await postJson("/advisor/generate");

  revalidatePath("/");
  revalidatePath("/advice");
}

export async function retryFailedJobsAction(): Promise<void> {
  await postJson("/ops/queue/retry-failed");

  revalidatePath("/");
  revalidatePath("/ops");
}
