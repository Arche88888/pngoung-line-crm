export interface AppConfig {
  apiHost: string;
  apiPort: number;
  lineChannelSecret: string;
  allowUnsignedWebhooks: boolean;
  analysisProvider: "heuristic" | "openai-compatible" | "openclaw";
  analysisModel: string;
  analysisApiKey: string;
  analysisBaseUrl: string;
  openClawBaseUrl: string;
  openClawApiKey: string;
  openClawModel: string;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true";
}

export function loadConfig(): AppConfig {
  return {
    apiHost: process.env.API_HOST ?? "0.0.0.0",
    apiPort: Number(process.env.PORT ?? process.env.API_PORT ?? 3001),
    lineChannelSecret: process.env.LINE_CHANNEL_SECRET ?? "",
    allowUnsignedWebhooks: readBoolean(process.env.LINE_ALLOW_UNSIGNED_WEBHOOKS, true),
    analysisProvider: (process.env.ANALYSIS_PROVIDER as AppConfig["analysisProvider"] | undefined) ?? "heuristic",
    analysisModel: process.env.ANALYSIS_MODEL ?? "gpt-4.1-mini",
    analysisApiKey: process.env.ANALYSIS_API_KEY ?? "",
    analysisBaseUrl: process.env.ANALYSIS_BASE_URL ?? "https://api.openai.com/v1",
    openClawBaseUrl: process.env.OPENCLAW_BASE_URL ?? process.env.ANALYSIS_BASE_URL ?? "http://localhost:8000/v1",
    openClawApiKey: process.env.OPENCLAW_API_KEY ?? process.env.ANALYSIS_API_KEY ?? "",
    openClawModel: process.env.OPENCLAW_MODEL ?? process.env.ANALYSIS_MODEL ?? "openclaw"
  };
}
