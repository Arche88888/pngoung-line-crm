import { retryFailedJobsAction } from "../actions";
import { SubmitButton } from "../../components/submit-button";
import { getProviderStatus, getQueueJobs, getQueueSnapshot } from "../../lib/api";

export default async function OpsPage() {
  const [snapshot, jobs, provider] = await Promise.all([
    getQueueSnapshot(),
    getQueueJobs(),
    getProviderStatus()
  ]);

  return (
    <div className="shell">
      <main>
        <section className="section-header">
          <div>
            <h1 style={{ margin: 0 }}>Ops</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              ดูสถานะ ingest queue และงานที่กำลังถูกประมวลผล
            </p>
          </div>
          <form action={retryFailedJobsAction} className="inline-form">
            <SubmitButton idleLabel="Retry Failed Jobs" pendingLabel="Retrying..." tone="strong" />
          </form>
        </section>

        <section className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div className="tag-list">
            <span className="tag">queued: {snapshot.queued}</span>
            <span className="tag">processing: {snapshot.processing}</span>
            <span className="tag">failed: {snapshot.failed}</span>
            <span className="tag">done: {snapshot.done}</span>
          </div>
        </section>

        <section className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>Provider Status</h2>
          <div className="tag-list">
            <span className="tag">provider: {provider.provider}</span>
            <span className="tag">ready: {String(provider.ready)}</span>
            <span className="tag">fallback: {String(provider.fallbackActive)}</span>
          </div>
          <p className="muted" style={{ marginBottom: 0 }}>{provider.message}</p>
        </section>

        <section className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Event</th>
                <th>Room</th>
                <th>Preview</th>
                <th>Attempts</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.status}</td>
                  <td>{job.sourceEventId}</td>
                  <td>{job.roomId}</td>
                  <td>{job.messagePreview}</td>
                  <td>{job.attempts}</td>
                  <td>{job.lastError ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
