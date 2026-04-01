import Link from "next/link";
import { getContactDetail } from "../../../lib/api";
import { ScoreBadge } from "../../../components/score-badge";

export default async function ContactDetailPage({
  params
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const detail = await getContactDetail(decodeURIComponent(contactId));

  return (
    <div className="shell">
      <main>
        <section className="section-header">
          <div>
            <div className="muted"><Link href="/contacts">Contacts</Link> / Customer Detail</div>
            <h1 style={{ margin: "8px 0 0" }}>{detail.contact.displayName}</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              มุมมอง customer-centric สำหรับดูลูกค้ารายคน, ห้องที่เกี่ยวข้อง และงานติดตาม
            </p>
          </div>
        </section>

        <section className="card-grid">
          <article className="card metric">
            <div className="muted">Messages</div>
            <div className="metric-value">{detail.contact.totalMessages}</div>
          </article>
          <article className="card metric">
            <div className="muted">Rooms</div>
            <div className="metric-value">{detail.contact.roomIds.length}</div>
          </article>
          <article className="card metric">
            <div className="muted">Sentiment</div>
            <div style={{ marginTop: 10 }}><ScoreBadge card={detail.contact.sentiment} /></div>
          </article>
          <article className="card metric">
            <div className="muted">Intent</div>
            <div style={{ marginTop: 10 }}><ScoreBadge card={detail.contact.purchaseIntent} /></div>
          </article>
        </section>

        <section className="section" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 16 }}>
          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>Customer Profile</h2>
            <div className="tag-list" style={{ marginBottom: 16 }}>
              {detail.contact.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
            <p><strong>Stage:</strong> {detail.contact.pipelineStage}</p>
            <p><strong>Last Message:</strong> {detail.contact.lastMessageAt ?? "-"}</p>
          </article>

          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>Related Rooms</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {detail.rooms.map((room) => (
                <article key={room.id} className="timeline-card">
                  <div className="timeline-meta">
                    <span>{room.sourceType}</span>
                    <span>{room.pipelineStage}</span>
                  </div>
                  <Link href={`/rooms/${encodeURIComponent(room.id)}`}><strong>{room.name}</strong></Link>
                  <p className="muted" style={{ marginBottom: 0 }}>{room.lastMessagePreview}</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="section card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Follow-up Tasks</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {detail.tasks.length > 0 ? detail.tasks.map((task) => (
              <article key={task.id} className="timeline-card">
                <div className="timeline-meta">
                  <span>{task.priority}</span>
                  <span>{task.status}</span>
                </div>
                <strong>{task.title}</strong>
                <p>{task.suggestedAction}</p>
              </article>
            )) : <p className="muted">ยังไม่มีงานที่โยงกับลูกค้ารายนี้</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
