import type {
  AnalysisProviderStatus,
  AdvisorSuggestion,
  AnalysisResult,
  ContactRecord,
  FollowUpTask,
  RoomRecord
} from "@pngoung/shared";
import type { AppConfig } from "../../config.js";
import { analyzeMessageText } from "./heuristics.js";

export interface AdvisorContext {
  rooms: RoomRecord[];
  contacts: ContactRecord[];
  tasks: FollowUpTask[];
}

export interface AnalysisProvider {
  name: string;
  analyzeText(text: string): Promise<AnalysisResult>;
  generateAdvisorSuggestions(context: AdvisorContext): Promise<AdvisorSuggestion[] | null>;
  getStatus(): Promise<AnalysisProviderStatus>;
}

class HeuristicAnalysisProvider implements AnalysisProvider {
  readonly name = "heuristic";

  async analyzeText(text: string): Promise<AnalysisResult> {
    return analyzeMessageText(text);
  }

  async generateAdvisorSuggestions(): Promise<AdvisorSuggestion[] | null> {
    return null;
  }

  async getStatus(): Promise<AnalysisProviderStatus> {
    return {
      provider: this.name,
      ready: true,
      fallbackActive: false,
      message: "Heuristic mode is active"
    };
  }
}

interface LlmProviderOptions {
  providerLabel: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  analysisSystemPrompt: string;
  advisorSystemPrompt: string;
}

class JsonLlmAnalysisProvider implements AnalysisProvider {
  readonly name: string;

  constructor(private readonly options: LlmProviderOptions) {
    this.name = `${options.providerLabel}:${options.model}`;
  }

  async analyzeText(text: string): Promise<AnalysisResult> {
    const json = await this.chatJson({
      system: this.options.analysisSystemPrompt,
      user: `ข้อความลูกค้า: ${text}`,
      expectedRoot: "object"
    });

    return normalizeAnalysisResult(json);
  }

  async generateAdvisorSuggestions(context: AdvisorContext): Promise<AdvisorSuggestion[] | null> {
    const json = await this.chatJson({
      system: this.options.advisorSystemPrompt,
      user: JSON.stringify({
        rooms: context.rooms.slice(0, 20),
        contacts: context.contacts.slice(0, 20),
        tasks: context.tasks.filter((task) => task.status === "open").slice(0, 20)
      }),
      expectedRoot: "object"
    });

    const suggestions = Array.isArray(json.suggestions) ? json.suggestions : [];
    if (suggestions.length === 0) return null;

    return suggestions.map((item, index) => ({
      id: item.id ?? `llm-${index + 1}`,
      priority: item.priority ?? "info",
      title: item.title ?? "คำแนะนำ",
      detail: item.detail ?? "",
      action: item.action ?? "",
      relatedRoomId: item.relatedRoomId ?? null,
      source: "llm"
    }));
  }

  async getStatus(): Promise<AnalysisProviderStatus> {
    const probe = await this.probe();
    return {
      provider: this.name,
      ready: probe.ready,
      fallbackActive: false,
      message: probe.message
    };
  }

  private async chatJson(input: { system: string; user: string; expectedRoot: "object" | "array" }): Promise<any> {
    const response = await fetch(`${this.options.baseUrl}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.options.apiKey}`
      },
      body: JSON.stringify({
        model: this.options.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.status}`);
    }

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned empty content");
    }

    const parsed = parseJsonLoosely(content);
    if (input.expectedRoot === "array" && !Array.isArray(parsed)) {
      throw new Error("LLM response is not an array");
    }
    return parsed;
  }

  private async probe(): Promise<{ ready: boolean; message: string }> {
    if (!this.options.apiKey) {
      return { ready: false, message: "API key is missing" };
    }

    try {
      const response = await fetch(`${this.options.baseUrl}/models`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
        headers: { authorization: `Bearer ${this.options.apiKey}` }
      });

      if (!response.ok) {
        return { ready: false, message: `Probe failed with HTTP ${response.status}` };
      }

      return { ready: true, message: `Connected to ${this.options.baseUrl}` };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Probe failed";
      return { ready: false, message };
    }
  }
}

class FallbackAnalysisProvider implements AnalysisProvider {
  readonly name: string;

  constructor(
    private readonly primary: AnalysisProvider,
    private readonly fallback: AnalysisProvider
  ) {
    this.name = `${primary.name} -> ${fallback.name}`;
  }

  async analyzeText(text: string): Promise<AnalysisResult> {
    try {
      return await this.primary.analyzeText(text);
    } catch {
      return this.fallback.analyzeText(text);
    }
  }

  async generateAdvisorSuggestions(context: AdvisorContext): Promise<AdvisorSuggestion[] | null> {
    try {
      const result = await this.primary.generateAdvisorSuggestions(context);
      if (result && result.length > 0) return result;
    } catch {
      return this.fallback.generateAdvisorSuggestions(context);
    }
    return this.fallback.generateAdvisorSuggestions(context);
  }

  async getStatus(): Promise<AnalysisProviderStatus> {
    const primaryStatus = await this.primary.getStatus().catch(() => ({
      provider: this.primary.name,
      ready: false,
      fallbackActive: true,
      message: "Primary provider status unavailable"
    }));

    return {
      provider: this.name,
      ready: true,
      fallbackActive: true,
      message: primaryStatus.ready
        ? `${primaryStatus.message} (fallback armed)`
        : `${primaryStatus.message} (running on fallback)`
    };
  }
}

export function createAnalysisProvider(config: AppConfig): AnalysisProvider {
  const heuristic = new HeuristicAnalysisProvider();

  if (config.analysisProvider === "openclaw") {
    return new FallbackAnalysisProvider(
      new JsonLlmAnalysisProvider({
        providerLabel: "openclaw",
        baseUrl: config.openClawBaseUrl,
        apiKey: config.openClawApiKey,
        model: config.openClawModel,
        analysisSystemPrompt: buildOpenClawAnalysisSystemPrompt(),
        advisorSystemPrompt: buildOpenClawAdvisorSystemPrompt()
      }),
      heuristic
    );
  }

  if (config.analysisProvider === "openai-compatible" && config.analysisApiKey) {
    return new FallbackAnalysisProvider(
      new JsonLlmAnalysisProvider({
        providerLabel: "openai-compatible",
        baseUrl: config.analysisBaseUrl,
        apiKey: config.analysisApiKey,
        model: config.analysisModel,
        analysisSystemPrompt: buildAnalysisSystemPrompt(),
        advisorSystemPrompt: buildAdvisorSystemPrompt()
      }),
      heuristic
    );
  }

  return heuristic;
}

function buildAnalysisSystemPrompt(): string {
  return [
    "คุณคือ AI วิเคราะห์ลูกค้า LINE CRM ของพี่ง้วง",
    "ตอบ JSON object เท่านั้น",
    '{"sentiment":{"score":0,"level":"green","reason":""},"purchaseIntent":{"score":0,"level":"green","reason":""},"tags":[],"pipelineStage":"new","summary":""}',
    "sentiment.level ใช้ได้เฉพาะ green, yellow, red",
    "purchaseIntent.level ใช้ได้เฉพาะ green, yellow, red",
    "pipelineStage ใช้ได้เฉพาะ new, engaged, interested, quoted, won, lost, follow_up",
    "summary ให้สั้นและเป็นภาษาไทย"
  ].join("\n");
}

function buildAdvisorSystemPrompt(): string {
  return [
    "คุณคือ AI CRM Advisor ของทีมขายและบริการ",
    "ตอบ JSON object เท่านั้น",
    '{"suggestions":[{"id":"s1","priority":"critical","title":"","detail":"","action":"","relatedRoomId":null,"source":"llm"}]}',
    "priority ใช้ได้เฉพาะ critical, warning, opportunity, info",
    "source ให้เป็น llm เสมอ",
    "เรียงคำแนะนำจากเรื่องสำคัญที่สุดก่อน",
    "detail และ action ให้เป็นภาษาไทยที่นำไปทำงานต่อได้ทันที"
  ].join("\n");
}

function buildOpenClawAnalysisSystemPrompt(): string {
  return [
    "คุณคือ OpenClaw analyst สำหรับระบบ LINE CRM ของพี่ง้วง",
    "หน้าที่คืออ่านบทสนทนาของลูกค้าแล้วสรุปสัญญาณทางธุรกิจให้ทีมใช้งานต่อได้ทันที",
    "ตอบ JSON object เท่านั้น",
    '{"sentiment":{"score":0,"level":"green","reason":""},"purchaseIntent":{"score":0,"level":"green","reason":""},"tags":[],"pipelineStage":"new","summary":""}',
    "ให้ตีความแบบธุรกิจการศึกษา/คอร์ส/ที่ปรึกษาเป็นหลัก",
    "tags ควรสื่อความหมายเชิงปฏิบัติ เช่น ถามราคา, ขอรายละเอียด, พร้อมสมัคร, ต้องติดตาม, objection, นัดคอล",
    "summary เป็นภาษาไทย กระชับ และใช้เป็นข้อความบน dashboard ได้ทันที"
  ].join("\n");
}

function buildOpenClawAdvisorSystemPrompt(): string {
  return [
    "คุณคือ OpenClaw advisor สำหรับผู้จัดการ LINE CRM",
    "สรุปคำแนะนำจาก rooms, contacts, tasks ให้ทีมขาย/ทีมดูแลลูกค้าลงมือทำต่อได้",
    "ตอบ JSON object เท่านั้น",
    '{"suggestions":[{"id":"s1","priority":"critical","title":"","detail":"","action":"","relatedRoomId":null,"source":"llm"}]}',
    "priority ใช้ได้เฉพาะ critical, warning, opportunity, info",
    "อย่าอธิบายเชิงเทคนิค ให้แนะนำแบบผู้จัดการทีมขาย",
    "ทุก action ต้องเป็นภาษาไทยและนำไปใช้ต่อได้เลย"
  ].join("\n");
}

function normalizeAnalysisResult(json: any): AnalysisResult {
  return {
    sentiment: json.sentiment,
    purchaseIntent: json.purchaseIntent,
    tags: Array.isArray(json.tags) ? json.tags.slice(0, 8) : [],
    pipelineStage: json.pipelineStage ?? "new",
    summary: json.summary ?? "LLM analysis"
  } satisfies AnalysisResult;
}

function parseJsonLoosely(content: string): any {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Unable to parse provider JSON output");
  }
}
