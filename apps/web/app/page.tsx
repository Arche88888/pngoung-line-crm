import Link from "next/link";
import { getLatestAdvisorReport, getQueueSnapshot, getSnapshot } from "../lib/api";
import { MockupLink } from "../components/mockup-link";

export default async function HomePage() {
  const [snapshot, report, queue] = await Promise.all([
    getSnapshot(),
    getLatestAdvisorReport(),
    getQueueSnapshot()
  ]);

  return (
    <div className="shell">
      <main>
        <header className="topbar">
          <div className="brand">
            <div className="brand-badge">CRM</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 34 }}>P'Ngoung LINE CRM</h1>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                ฐานระบบสำหรับเปลี่ยน LINE chat ให้กลายเป็น CRM ที่วิเคราะห์ได้
              </p>
            </div>
          </div>
          <nav className="nav-links">
            <Link className="nav-link" href="/rooms">Rooms</Link>
            <Link className="nav-link" href="/contacts">Contacts</Link>
            <Link className="nav-link" href="/tasks">Tasks</Link>
            <Link className="nav-link" href="/advice">Advice</Link>
            <Link className="nav-link" href="/ops">Ops</Link>
            <MockupLink />
          </nav>
        </header>

        <section className="card-grid">
          <article className="card metric">
            <div className="muted">Rooms</div>
            <div className="metric-value">{snapshot.rooms}</div>
          </article>
          <article className="card metric">
            <div className="muted">Contacts</div>
            <div className="metric-value">{snapshot.contacts}</div>
          </article>
          <article className="card metric">
            <div className="muted">Hot Leads</div>
            <div className="metric-value">{snapshot.hotLeads}</div>
          </article>
          <article className="card metric">
            <div className="muted">Urgent Rooms</div>
            <div className="metric-value">{snapshot.urgentRooms}</div>
          </article>
          <article className="card metric">
            <div className="muted">Open Tasks</div>
            <div className="metric-value">{snapshot.openTasks}</div>
          </article>
          <article className="card metric">
            <div className="muted">Pending Jobs</div>
            <div className="metric-value">{snapshot.pendingJobs}</div>
          </article>
        </section>

        <section className="section card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>เวอร์ชันนี้มีอะไรแล้ว</h2>
          <p className="muted">
            Backend รับ LINE webhook, verify signature, normalize event, วิเคราะห์ข้อความเบื้องต้น และ project เป็น rooms / contacts / messages / tasks ได้แล้ว
          </p>
          <p className="muted" style={{ marginBottom: 0 }}>
            ตอนนี้ข้อมูลถูก persist ลงไฟล์ในเครื่องแล้ว และพร้อมต่อยอดไป queue กับ AI worker ในรอบถัดไปค่ะ
          </p>
        </section>

        <section className="section card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Advisor ล่าสุด</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Provider: {report.provider} \u00B7 Generated: {report.generatedAt}
          </p>
          <div className="tag-list">
            {report.suggestions.map((suggestion) => (
              <span className="tag" key={suggestion.id}>
                {suggestion.priority}: {suggestion.title}
              </span>
            ))}
          </div>
        </section>

        <section className="section card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Queue Snapshot</h2>
          <div className="tag-list">
            <span className="tag">queued: {queue.queued}</span>
            <span className="tag">processing: {queue.processing}</span>
            <span className="tag">failed: {queue.failed}</span>
            <span className="tag">done: {queue.done}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
