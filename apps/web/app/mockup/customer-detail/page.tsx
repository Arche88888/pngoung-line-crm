import Link from "next/link";

export default function MockupCustomerDetailPage() {
  return (
    <div className="shell shell-mockup">
      <main className="mockup-main">
        <header className="mockup-topbar">
          <div>
            <div className="mockup-eyebrow">Mockup / Customer Detail</div>
            <h1 className="mockup-title">หน้า customer detail ที่ทีมเปิดแล้วรู้ทันทีว่าควร follow-up ยังไง</h1>
            <p className="mockup-subtitle">
              มุมนี้เน้น customer-centric view เพื่อให้ทีมไม่ได้มองแค่ห้องแชท แต่เห็นประวัติ ความร้อน และงานค้างของลูกค้ารายคนค่ะ
            </p>
          </div>
          <div className="mockup-actions">
            <Link className="nav-link" href="/mockup" prefetch={false}>Dashboard Mockup</Link>
            <Link className="nav-link nav-link-strong" href="/mockup/cockpit" prefetch={false}>Open Cockpit</Link>
          </div>
        </header>

        <section className="mockup-grid">
          <section className="mock-card mock-card-span-4">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Customer Profile</div>
                <h3>คุณเมย์ วอร์มมาก</h3>
              </div>
            </div>
            <div className="campaign-list">
              <article className="campaign-card">
                <div className="campaign-top">
                  <strong>Stage</strong>
                  <span>Interested</span>
                </div>
                <p>ถามราคา, วันเริ่มเรียน, รูปแบบเรียน, และขอ comparison package ครบแล้ว</p>
              </article>
              <article className="campaign-card">
                <div className="tag-list">
                  <span className="tag">ถามราคา</span>
                  <span className="tag">พร้อมคุย</span>
                  <span className="tag">สนใจเรียน</span>
                </div>
              </article>
              <article className="campaign-card">
                <div className="campaign-top">
                  <strong>Next Best Action</strong>
                </div>
                <p>ส่งข้อเสนอ 2 แพ็ก + ชวนคอล 15 นาทีภายในวันนี้</p>
              </article>
            </div>
          </section>

          <section className="mock-card mock-card-span-8">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Journey Timeline</div>
                <h3>ประวัติการคุยและจุดตัดสินใจ</h3>
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <article className="timeline-card">
                <div className="timeline-meta"><span>Mar 18</span><span>Lead capture</span></div>
                <strong>ทักเข้ามาจากคอนเทนต์ &ldquo;AI ใช้ในธุรกิจจริงยังไง&rdquo;</strong>
                <p className="muted">เริ่มจากถามว่าคอร์สนี้เหมาะกับเจ้าของธุรกิจหรือไม่</p>
              </article>
              <article className="timeline-card">
                <div className="timeline-meta"><span>Mar 19</span><span>Qualification</span></div>
                <strong>ถามเรื่องวันเรียนและรูปแบบ live / replay</strong>
                <p className="muted">ระบบตีความเป็น engaged และติดแท็ก สนใจเรียน</p>
              </article>
              <article className="timeline-card">
                <div className="timeline-meta"><span>Today</span><span>Decision stage</span></div>
                <strong>ขอราคาและถามโปรล่าสุด</strong>
                <p className="muted">กลายเป็น hot lead และถูกส่งเข้ากลุ่มงานเสนอราคาอัตโนมัติ</p>
              </article>
            </div>
          </section>

          <section className="mock-card mock-card-span-6">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">AI Summary</div>
                <h3>ระบบสรุปให้ทีมอ่านแทนการไล่แชท</h3>
              </div>
            </div>
            <article className="advisor-card advisor-opportunity">
              <div className="advisor-priority">Opportunity</div>
              <h4>คุณเมย์มีแนวโน้มปิดการขายได้ใน 24 ชั่วโมง</h4>
              <p>เหตุผลคือถามครบทั้งราคา, วันเริ่ม, รูปแบบการเรียน และยังไม่มี objection แรง</p>
              <strong>ควรให้แอดมินส่งแพ็กเกจพร้อม CTA นัดคอลทันที</strong>
            </article>
          </section>

          <section className="mock-card mock-card-span-6">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Tasks</div>
                <h3>สิ่งที่ทีมต้องทำต่อ</h3>
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <article className="timeline-card">
                <div className="timeline-meta"><span>high</span><span>ภายใน 2 ชม.</span></div>
                <strong>ส่งข้อเสนอแพ็กเกจ</strong>
                <p>เลือก 2 ตัวเลือกที่ต่างกันชัด เพื่อให้ลูกค้าตัดสินใจง่าย</p>
              </article>
              <article className="timeline-card">
                <div className="timeline-meta"><span>normal</span><span>เย็นนี้</span></div>
                <strong>ตามผลหลังส่งราคา</strong>
                <p>ถามต่อว่าแบบไหนเหมาะกับเป้าหมายธุรกิจของลูกค้ามากกว่า</p>
              </article>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
