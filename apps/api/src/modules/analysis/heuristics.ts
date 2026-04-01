import type { AnalysisResult, PipelineStage, ScoreCard, ScoreLevel } from "@pngoung/shared";

const interestKeywords = ["ราคา", "คอร์ส", "สมัคร", "รายละเอียด", "เรียน", "อบรม", "โปรโมชั่น", "โปร", "สนใจ", "เริ่ม"];
const urgentKeywords = ["ด่วน", "รีบ", "ตอนนี้", "ทันที", "ช่วยด้วย"];
const negativeKeywords = ["ไม่โอเค", "แย่", "ผิดหวัง", "ช้า", "ปัญหา", "ยกเลิก", "ไม่ตอบ"];

function buildScore(score: number, level: ScoreLevel, reason: string): ScoreCard {
  return { score, level, reason };
}

function inferTags(text: string): string[] {
  const tags = new Set<string>();
  const normalized = text.toLowerCase();

  if (normalized.includes("ราคา")) tags.add("ถามราคา");
  if (normalized.includes("โปร")) tags.add("ถามโปร");
  if (normalized.includes("สมัคร")) tags.add("พร้อมสมัคร");
  if (normalized.includes("เรียน")) tags.add("สนใจเรียน");
  if (negativeKeywords.some((keyword) => normalized.includes(keyword))) tags.add("ต้องติดตาม");
  if (urgentKeywords.some((keyword) => normalized.includes(keyword))) tags.add("เร่งด่วน");

  return [...tags];
}

function inferPurchaseIntent(text: string): ScoreCard {
  const matches = interestKeywords.filter((keyword) => text.includes(keyword)).length;
  if (matches >= 3) return buildScore(82, "red", "ลูกค้ามีคำถามเชิงตัดสินใจหลายจุด");
  if (matches >= 1) return buildScore(55, "yellow", "เริ่มมีสัญญาณสนใจซื้อ");
  return buildScore(18, "green", "ยังไม่เห็นสัญญาณซื้อชัด");
}

function inferSentiment(text: string): ScoreCard {
  if (negativeKeywords.some((keyword) => text.includes(keyword))) {
    return buildScore(22, "red", "มีถ้อยคำเชิงลบหรือความไม่พอใจ");
  }

  if (urgentKeywords.some((keyword) => text.includes(keyword))) {
    return buildScore(48, "yellow", "มีความเร่งด่วน ควรติดตามใกล้ชิด");
  }

  return buildScore(78, "green", "บทสนทนาเป็นกลางถึงบวก");
}

function inferPipelineStage(purchaseIntent: ScoreCard, tags: string[]): PipelineStage {
  if (tags.includes("พร้อมสมัคร")) return "won";
  if (purchaseIntent.level === "red") return "interested";
  if (purchaseIntent.level === "yellow") return "engaged";
  return "new";
}

export function analyzeMessageText(text: string): AnalysisResult {
  const sentiment = inferSentiment(text);
  const purchaseIntent = inferPurchaseIntent(text);
  const tags = inferTags(text);
  const pipelineStage = inferPipelineStage(purchaseIntent, tags);

  return {
    sentiment,
    purchaseIntent,
    tags,
    pipelineStage,
    summary: tags.length > 0 ? `Detected: ${tags.join(", ")}` : "No strong signal yet"
  };
}
