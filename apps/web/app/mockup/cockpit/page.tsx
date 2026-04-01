import Link from "next/link";

export default function MockupCockpitPage() {
  return (
    <div className="shell shell-mockup">
      <main className="mockup-main">
        <header className="mockup-topbar">
          <div>
            <div className="mockup-eyebrow">Mockup / Conversation Cockpit</div>
            <h1 className="mockup-title">ห้องเดียว แต่เห็นทั้งแชท, สัญญาณ, งานค้าง, และ action panel</h1>
            <p className="mockup-subtitle">
              หน้านี้คือ cockpit จริงสำหรับคนที่ต้องลงมือทำงานกับลูกค้า ไม่ใช่แค่ดู dashboard รวมค่ะ
            </p>
          </div>
          <div className="mockup-actions">
            <Link className="nav-link" href="/mockup" prefetch={false}>Dashboard Mockup</Link>
            <Link className="nav-link nav-link-strong" href="/mockup/customer-detail" prefetch={false}>Customer Detail</Link>
          </div>
        </header>

        <section className="mockup-grid">
          <section className="mock-card mock-card-span-8">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Conversation</div>
                <h3>OA: คุณโอ๊ต ลูกค้าเก่า</h3>
              </div>
              <span className="mock-pill">แดงเพราะ sentiment และ SLA</span>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <article className="timeline-card timeline-left">
                <div className="timeline-meta"><span>ลูกค้า</span><span>09:08</span></div>
                <strong>ยังไม่ได้รับคำตอบจากเมื่อเช้าเลยครับ</strong>
              </article>
              <article className="timeline-card timeline-left">
                <div className="timeline-meta"><span>ลูกค้า</span><span>09:11</span></div>
                <strong>ช้ามาก ไม่โอเคเลย รบกวนช่วยเช็กให้ที</strong>
              </article>
              <article className="timeline-card timeline-right">
                <div className="timeline-meta"><span>AI Draft</span><span>Suggested</span></div>
                <strong>ขอโทษที่ทำให้รอนานนะครับ เดี๋ยวผมเช็กให้ทันทีและจะอัปเดตภายใน 10 นาทีครับ</strong>
                <p className="muted">draft จาก service recovery assistant</p>
              </article>
            </div>
          </section>

          <section className="mock-card mock-card-span-4">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Action Rail</div>
                <h3>แถบตัดสินใจเร็ว</h3>
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <article className="campaign-card">
                <div className="campaign-top"><strong>Urgency</strong><span>critical</span></div>
                <p>ลูกค้ารอเกิน SLA และเริ่มมีประโยคเชิงลบแล้ว</p>
              </article>
              <article className="campaign-card">
                <div className="campaign-top"><strong>Best Reply Mode</strong><span>Empathize</span></div>
                <p>เริ่มจากขอโทษ + ยืนยันเวลาที่จะอัปเดตกลับ</p>
              </article>
              <article className="campaign-card">
                <div className="campaign-top"><strong>Next Actions</strong></div>
                <p>โทรกลับ, mark urgent, แจ้ง owner และเปิด task ติดตามเคส</p>
              </article>
            </div>
          </section>

          <section className="mock-card mock-card-span-6">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Signals</div>
                <h3>สิ่งที่ AI มองเห็นในห้องนี้</h3>
              </div>
            </div>
            <div className="tag-list" style={{ marginBottom: 16 }}>
              <span className="tag">slow response</span>
              <span className="tag">negative sentiment</span>
              <span className="tag">customer recovery</span>
            </div>
            <article className="advisor-card advisor-critical">
              <div className="advisor-priority">critical</div>
              <h4>ถ้ายังไม่ตอบใน 10 นาที ความเสี่ยงจะเพิ่มอีก</h4>
              <p>ระบบแนะนำให้ prioritize ห้องนี้เหนือห้องขาย เพราะเป็นเรื่องความสัมพันธ์ลูกค้า</p>
              <strong>เป้าหมายตอนนี้คือกู้ความเชื่อมั่นก่อน</strong>
            </article>
          </section>

          <section className="mock-card mock-card-span-6">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Task Console</div>
                <h3>งานที่พร้อมกดต่อ</h3>
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <article className="timeline-card">
                <div className="timeline-meta"><span>Task 1</span><span>Open</span></div>
                <strong>โทรกลับคุณโอ๊ต</strong>
                <p>รับผิดชอบโดยพี่ง้วง เพราะเป็นลูกค้าเก่าและความรู้สึกเริ่มติดลบ</p>
              </article>
              <article className="timeline-card">
                <div className="timeline-meta"><span>Task 2</span><span>Open</span></div>
                <strong>สรุป root cause ให้ทีม</strong>
                <p>เพื่อป้องกันไม่ให้เคสตอบช้าซ้ำในรอบถัดไป</p>
              </article>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
