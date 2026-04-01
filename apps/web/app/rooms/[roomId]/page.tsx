import Link from "next/link";
import { getRoomDetail } from "../../../lib/api";
import { ScoreBadge } from "../../../components/score-badge";

export default async function RoomDetailPage({
  params
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const detail = await getRoomDetail(decodeURIComponent(roomId));

  return (
    <div className="shell">
      <main>
        <section className="section-header">
          <div>
            <div className="muted"><Link href="/rooms">Rooms</Link> / Cockpit</div>
            <h1 style={{ margin: "8px 0 0" }}>{detail.room.name}</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              มุมมองห้องสนทนาแบบ cockpit สำหรับดูสัญญาณลูกค้า, งานค้าง และข้อความล่าสุด
            </p>
          </div>
        </section>

        <section className="card-grid">
          <article className="card metric">
            <div className="muted">Messages</div>
            <div className="metric-value">{detail.room.messageCount}</div>
          </article>
          <article className="card metric">
            <div className="muted">Stage</div>
            <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700 }}>{detail.room.pipelineStage}</div>
          </article>
          <article className="card metric">
            <div className="muted">Sentiment</div>
            <div style={{ marginTop: 10 }}><ScoreBadge card={detail.room.sentiment} /></div>
          </article>
          <article className="card metric">
            <div className="muted">Intent</div>
            <div style={{ marginTop: 10 }}><ScoreBadge card={detail.room.purchaseIntent} /></div>
          </article>
        </section>

        <section className="section" style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr", gap: 16 }}>
          <article className="card" style={{ padding: 20 }}>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0 }}>Conversation Timeline</h2>
                <p className="muted" style={{ margin: "6px 0 0" }}>ข้อความที่ผ่านการ ingest แล้ว</p>
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {detail.messages.map((message) => (
                <article key={message.id} className="timeline-card">
                  <div className="timeline-meta">
                    <span>{message.messageType}</span>
                    <span>{message.createdAt}</span>
                  </div>
                  <strong>{message.text}</strong>
                  <p className="muted" style={{ marginBottom: 0 }}>{message.analysis.summary}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0 }}>Open Tasks</h2>
                <p className="muted" style={{ margin: "6px 0 0" }}>งานที่เกิดจากห้องนี้</p>
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {detail.tasks.length > 0 ? detail.tasks.map((task) => (
                <article key={task.id} className="timeline-card">
                  <div className="timeline-meta">
                    <span>{task.priority}</span>
                    <span>{task.dueAt}</span>
                  </div>
                  <strong>{task.title}</strong>
                  <p>{task.suggestedAction}</p>
                </article>
              )) : <p className="muted">ยังไม่มีงานสำหรับห้องนี้</p>}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
