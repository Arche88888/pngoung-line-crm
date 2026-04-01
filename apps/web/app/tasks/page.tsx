import Link from "next/link";
import { markTaskDoneAction } from "../actions";
import { SubmitButton } from "../../components/submit-button";
import { getTasks } from "../../lib/api";

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="shell">
      <main>
        <section className="section-header">
          <div>
            <h1 style={{ margin: 0 }}>Tasks</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              งานติดตามที่ระบบสร้างให้อัตโนมัติจากแชท
            </p>
          </div>
        </section>

        <section className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Trigger</th>
                <th>Suggested Action</th>
                <th>Due</th>
                <th>Status</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    <div className="muted">{task.detail}</div>
                  </td>
                  <td>
                    <span className={`badge ${task.priority === "critical" ? "red" : task.priority === "high" ? "yellow" : "green"}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <div>{task.trigger}</div>
                    <div className="muted">
                      <Link href={`/rooms/${encodeURIComponent(task.roomId)}`}>open room</Link>
                    </div>
                  </td>
                  <td>{task.suggestedAction}</td>
                  <td>{task.dueAt}</td>
                  <td>
                    <span className={`badge ${task.status === "done" ? "green" : task.priority === "critical" ? "red" : "yellow"}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    {task.status === "done" ? (
                      <span className="muted">ติดตามแล้ว</span>
                    ) : (
                      <form action={markTaskDoneAction} className="inline-form">
                        <input name="taskId" type="hidden" value={task.id} />
                        <input name="roomId" type="hidden" value={task.roomId} />
                        <input name="contactId" type="hidden" value={task.contactId} />
                        <SubmitButton idleLabel="Mark Done" pendingLabel="Saving..." />
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
