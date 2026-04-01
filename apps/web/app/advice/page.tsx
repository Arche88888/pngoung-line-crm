import { generateAdvisorAction } from "../actions";
import { SubmitButton } from "../../components/submit-button";
import { getLatestAdvisorReport } from "../../lib/api";

export default async function AdvicePage() {
  const report = await getLatestAdvisorReport();

  return (
    <div className="shell">
      <main>
        <section className="section-header">
          <div>
            <h1 style={{ margin: 0 }}>Advice</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              คำแนะนำล่าสุดจาก advisor ของระบบ
            </p>
          </div>
          <form action={generateAdvisorAction} className="inline-form">
            <SubmitButton idleLabel="Generate New Advice" pendingLabel="Generating..." tone="strong" />
          </form>
        </section>

        <section className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div className="muted">Provider: {report.provider}</div>
          <div className="muted">Generated: {report.generatedAt}</div>
        </section>

        <section className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Title</th>
                <th>Detail</th>
                <th>Action</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {report.suggestions.map((suggestion) => (
                <tr key={suggestion.id}>
                  <td>
                    <span className={`badge ${suggestion.priority === "critical" ? "red" : suggestion.priority === "warning" ? "yellow" : "green"}`}>
                      {suggestion.priority}
                    </span>
                  </td>
                  <td>{suggestion.title}</td>
                  <td>{suggestion.detail}</td>
                  <td>{suggestion.action}</td>
                  <td>{suggestion.relatedRoomId ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
