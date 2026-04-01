# P'Ngoung LINE CRM

ฐานโปรเจกต์สำหรับระบบ LINE CRM ที่แยกชั้น `ingest`, `analysis`, `crm projection`, และ `dashboard` ตั้งแต่เริ่ม

## โครงสร้าง

- `apps/api` Fastify API สำหรับ webhook, CRM API, และ analysis เบื้องต้น
- `apps/web` Next.js dashboard สำหรับดู rooms และ contacts
- `packages/shared` type และ schema กลางของระบบ
- `docs/architecture.md` ภาพสถาปัตยกรรมและ data flow รุ่นแรก
- `docs/handoff` ชุดเอกสารส่งต่อทีมแบบ PRD + BMAD + TECH SPEC + API SPEC + PLAN

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

ค่าเริ่มต้น:

- API: `http://localhost:3001`
- Web: `http://localhost:3000`

## แนวคิดของเวอร์ชันนี้

- รับ LINE webhook แล้ว normalize เป็น event กลาง
- วิเคราะห์ข้อความด้วย heuristic ก่อน เพื่อให้ flow เดินได้แม้ยังไม่ต่อ LLM
- รองรับ analysis provider แบบสลับได้: `heuristic`, `openai-compatible`, หรือ `openclaw`
- สร้าง room/contact projection ทันทีจาก event
- สร้าง follow-up task จากสัญญาณร้อนหรือสัญญาณเสี่ยงในบทสนทนา
- persist ข้อมูลลง `data/crm-store.json`
- มี advisor สรุปคำแนะนำจาก rooms / contacts / tasks
- webhook แค่ enqueue งาน แล้ว worker จะ process ต่อแบบ async
- มี OpenClaw integration แบบ first-class พร้อม fallback กลับ heuristic ถ้า provider ล่ม

## OpenClaw

ถ้าต้องการใช้ OpenClaw เป็น provider หลัก:

```bash
ANALYSIS_PROVIDER=openclaw
OPENCLAW_BASE_URL=http://your-openclaw-host/v1
OPENCLAW_API_KEY=...
OPENCLAW_MODEL=openclaw
```

ระบบจะ:

- ใช้ OpenClaw วิเคราะห์ข้อความและสร้าง advisor suggestions
- probe health ผ่าน `/ops/provider`
- fallback กลับ heuristic อัตโนมัติถ้า endpoint ใช้งานไม่ได้

สำหรับการทดสอบในเครื่อง มี mock server ให้ใช้:

```bash
node scripts/mock-openclaw-server.mjs
ANALYSIS_PROVIDER=openclaw OPENCLAW_BASE_URL=http://127.0.0.1:8000/v1 OPENCLAW_API_KEY=test OPENCLAW_MODEL=openclaw npm run dev --workspace @pngoung/api
```

จากนั้นเช็กได้ที่:

- `GET /ops/provider` ดูว่า provider พร้อมหรือไม่
- `POST /advisor/generate` บังคับสร้าง advice รอบใหม่
- หน้า `/ops`, `/advice`, `/tasks` จะมี action ให้กดใช้งานจริงจาก dashboard แล้ว

## ลำดับถัดไปที่ควรทำ

1. ต่อ persistent database
2. เปลี่ยน analysis จาก heuristic เป็น AI worker
3. เพิ่ม queue และ retry สำหรับ webhook ingest
4. เพิ่ม auth และ role-based dashboard
