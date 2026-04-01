import Link from "next/link";

const roomSignals = [
  {
    name: "OA: คุณเมย์ สนใจคอร์ส AI",
    status: "Lead ร้อน",
    stage: "interested",
    owner: "แอดมินฝ้าย",
    sentiment: "green",
    intent: "red",
    lastMessage: "ขอราคาโปรและถามว่าเริ่มเรียนได้วันไหน",
    nextAction: "ส่งแพ็กเกจ + ชวนจองคอล",
    age: "2 นาทีที่แล้ว"
  },
  {
    name: "Group: Workshop มีนา 2026",
    status: "ต้องดูแล",
    stage: "follow_up",
    owner: "ทีมโค้ช",
    sentiment: "yellow",
    intent: "yellow",
    lastMessage: "มีหลายคนถามเรื่องรีเพลย์และเอกสารประกอบ",
    nextAction: "สรุป FAQ แล้วปักหมุด",
    age: "11 นาทีที่แล้ว"
  },
  {
    name: "OA: คุณโอ๊ต ลูกค้าเก่า",
    status: "ไม่พอใจ",
    stage: "service",
    owner: "พี่ง้วง",
    sentiment: "red",
    intent: "green",
    lastMessage: "ยังไม่ได้รับคำตอบ ช้ามาก ไม่โอเคเลย",
    nextAction: "โทรกลับและเคลียร์เคส",
    age: "1 นาทีที่แล้ว"
  }
];

const pipeline = [
  { title: "New", count: 18, color: "soft" },
  { title: "Engaged", count: 9, color: "sun" },
  { title: "Interested", count: 7, color: "mint" },
  { title: "Quoted", count: 4, color: "peach" },
  { title: "Won", count: 3, color: "forest" }
];

const advisorCards = [
  {
    priority: "critical",
    title: "รีบปิดเคสคุณโอ๊ตภายใน 30 นาที",
    detail: "มีข้อความเชิงลบชัดเจนและเสี่ยงเสียความรู้สึกลูกค้า ถ้าตอบช้าอีกจะหลุดง่าย",
    action: "โทรกลับเอง + ให้ทีมสรุป timeline ปัญหา"
  },
  {
    priority: "opportunity",
    title: "คุณเมย์พร้อมเข้าสู่ขั้นเสนอราคา",
    detail: "ถามราคา, วันเริ่มเรียน, และขอรูปแบบการเรียนครบแล้ว ถือว่าอยู่ช่วงตัดสินใจ",
    action: "ส่งข้อเสนอ 2 แพ็ก พร้อม CTA นัดคอล"
  },
  {
    priority: "warning",
    title: "กลุ่ม Workshop ต้องมี FAQ กลาง",
    detail: "คำถามเรื่องรีเพลย์เริ่มซ้ำ แปลว่าระบบ support ยังไม่ชัด",
    action: "สร้าง FAQ card + rich message ปักหมุด"
  }
];

const campaigns = [
  {
    name: "AI Starter Promo",
    audience: "Lead ที่ถามราคาใน 7 วัน",
    message: "ส่งโปรเปิดใจ + โบนัส checklist",
    lift: "+18% reply"
  },
  {
    name: "Warm Re-Engage",
    audience: "คนที่เคยสนใจแต่เงียบไป",
    message: "ชวนกลับมาดูคลาสรอบใหม่",
    lift: "+11% re-open"
  }
];

export default function MockupPage() {
  return (
    <div className="shell shell-mockup">
      <main className="mockup-main">
        <header className="mockup-topbar">
          <div>
            <div className="mockup-eyebrow">P&apos;Ngoung LINE CRM / Live Ops Mockup</div>
            <h1 className="mockup-title">แชทเยอะขึ้น แต่ทีมยังเห็นว่าใครต้องตอบ ใครพร้อมซื้อ และใครเสี่ยงหลุด</h1>
            <p className="mockup-subtitle">
              mockup นี้ตั้งใจให้เห็นภาพตอนระบบ mature แล้ว: LINE OA, LINE Group, advisor, campaign และ CRM
              มาทำงานบนจอเดียวกันค่ะ
            </p>
          </div>
          <div className="mockup-actions">
            <Link className="nav-link" href="/mockup/customer-detail" prefetch={false}>Customer Detail</Link>
            <Link className="nav-link" href="/mockup/cockpit" prefetch={false}>Cockpit</Link>
            <Link className="nav-link nav-link-strong" href="/" prefetch={false}>Back to Live Scaffold</Link>
            <span className="mockup-status">Demo View</span>
          </div>
        </header>

        <section className="mockup-hero">
          <div className="hero-copy">
            <div className="hero-chip">Today 09:41</div>
            <h2>&ldquo;ห้องไหนต้องรีบเข้า, lead ไหนกำลังร้อน, และควรส่งโปรอะไร&rdquo;</h2>
            <p>
              หน้านี้ออกแบบให้ทีมเปิดเช้าแล้วตัดสินใจได้เร็ว ไม่ต้องไล่อ่านแชททีละห้องก่อนถึงจะรู้ว่าควรทำอะไรค่ะ
            </p>
            <div className="hero-metrics">
              <article className="hero-metric">
                <span className="metric-label">Pending Reply</span>
                <strong>06</strong>
              </article>
              <article className="hero-metric">
                <span className="metric-label">Hot Leads</span>
                <strong>07</strong>
              </article>
              <article className="hero-metric">
                <span className="metric-label">At Risk</span>
                <strong>03</strong>
              </article>
              <article className="hero-metric">
                <span className="metric-label">Campaign Ready</span>
                <strong>12</strong>
              </article>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-header">
              <span>Ops Pulse</span>
              <span className="pulse-dot" />
            </div>
            <div className="pulse-list">
              <div className="pulse-item">
                <strong>2 ห้องต้องตอบใน 15 นาที</strong>
                <span>system flagged via SLA + sentiment</span>
              </div>
              <div className="pulse-item">
                <strong>4 lead ถามราคาใน 24 ชม.</strong>
                <span>พร้อมเข้าขั้น quoted ได้ทันที</span>
              </div>
              <div className="pulse-item">
                <strong>1 กลุ่มควร broadcast FAQ</strong>
                <span>คำถามซ้ำเรื่องรีเพลย์เพิ่มขึ้น</span>
              </div>
            </div>
          </div>
        </section>
        <section className="mockup-grid">
          <section className="mock-card mock-card-span-8">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Live Queue</div>
                <h3>ห้องที่ควรดูตอนนี้</h3>
              </div>
              <span className="mock-pill">Sorted by urgency + intent</span>
            </div>

            <div className="signal-list">
              {roomSignals.map((signal) => (
                <article className="signal-card" key={signal.name}>
                  <div className="signal-card-top">
                    <div>
                      <div className="signal-name">{signal.name}</div>
                      <div className="signal-meta">{signal.owner} · {signal.age}</div>
                    </div>
                    <div className="signal-badges">
                      <span className={`badge ${signal.sentiment}`}>sentiment {signal.sentiment}</span>
                      <span className={`badge ${signal.intent}`}>intent {signal.intent}</span>
                    </div>
                  </div>
                  <div className="signal-stage-row">
                    <span className="signal-stage">{signal.stage}</span>
                    <span className="signal-status">{signal.status}</span>
                  </div>
                  <p className="signal-message">{signal.lastMessage}</p>
                  <div className="signal-action">
                    <span>Next</span>
                    <strong>{signal.nextAction}</strong>
                  </div>
                  <div className="signal-links">
                    <Link href={signal.name.includes("คุณเมย์") ? "/mockup/customer-detail" : "/mockup/cockpit"} prefetch={false}>
                      Open Detail
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mock-card mock-card-span-4">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Pipeline</div>
                <h3>Lead Flow วันนี้</h3>
              </div>
            </div>

            <div className="pipeline-stack">
              {pipeline.map((item) => (
                <div className={`pipeline-lane pipeline-${item.color}`} key={item.title}>
                  <span>{item.title}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="mock-card mock-card-span-7">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">AI Advisor</div>
                <h3>คำแนะนำที่ระบบสรุปให้ทีม</h3>
              </div>
              <span className="mock-pill">Every hour / on demand</span>
            </div>

            <div className="advisor-deck">
              {advisorCards.map((item) => (
                <article className={`advisor-card advisor-${item.priority}`} key={item.title}>
                  <div className="advisor-priority">{item.priority}</div>
                  <h4>{item.title}</h4>
                  <p>{item.detail}</p>
                  <strong>{item.action}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="mock-card mock-card-span-5">
            <div className="mock-card-header">
              <div>
                <div className="card-kicker">Campaign Match</div>
                <h3>โปร/การติดตามที่ควรยิงต่อ</h3>
              </div>
            </div>

            <div className="campaign-list">
              {campaigns.map((campaign) => (
                <article className="campaign-card" key={campaign.name}>
                  <div className="campaign-top">
                    <strong>{campaign.name}</strong>
                    <span>{campaign.lift}</span>
                  </div>
                  <div className="campaign-audience">{campaign.audience}</div>
                  <p>{campaign.message}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
