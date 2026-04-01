import type { FastifyInstance } from "fastify";
import { crmStore } from "../modules/crm/store.js";

export async function registerCrmRoutes(app: FastifyInstance): Promise<void> {
  app.get("/crm/snapshot", async () => crmStore.getSnapshot());
  app.get("/crm/rooms", async () => crmStore.listRooms());
  app.get("/crm/contacts", async () => crmStore.listContacts());
  app.get("/crm/tasks", async () => crmStore.listTasks());
  app.get<{ Params: { roomId: string } }>("/crm/rooms/:roomId", async (request, reply) => {
    const room = crmStore.getRoom(request.params.roomId);
    if (!room) {
      return reply.code(404).send({ error: "room not found" });
    }

    return {
      room,
      messages: crmStore.listMessages(request.params.roomId),
      tasks: crmStore.listTasksByRoom(request.params.roomId)
    };
  });
  app.get<{ Params: { contactId: string } }>("/crm/contacts/:contactId", async (request, reply) => {
    const contact = crmStore.getContact(request.params.contactId);
    if (!contact) {
      return reply.code(404).send({ error: "contact not found" });
    }

    return {
      contact,
      tasks: crmStore.listTasksByContact(request.params.contactId),
      rooms: contact.roomIds
        .map((roomId) => crmStore.getRoom(roomId))
        .filter((room): room is NonNullable<typeof room> => room !== null)
    };
  });
  app.post<{ Params: { taskId: string } }>("/crm/tasks/:taskId/done", async (request, reply) => {
    const task = crmStore.markTaskDone(request.params.taskId);
    if (!task) {
      return reply.code(404).send({ error: "task not found" });
    }

    return task;
  });
  app.get<{ Querystring: { roomId: string } }>("/crm/messages", async (request, reply) => {
    if (!request.query.roomId) {
      return reply.code(400).send({ error: "roomId is required" });
    }

    return crmStore.listMessages(request.query.roomId);
  });
}
