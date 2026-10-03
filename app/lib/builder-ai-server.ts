import type { BuilderAnswers, BuilderOrchestratorState, BuilderResearch, BuildCapability, DeviceIntelligenceMode, ResearchDecision } from "./builder-contract";
import { deterministicOrchestrator } from "./builder-orchestrator";

const API_URL = "https://api.openai.com/v1/responses";

function configured() {
  return Boolean(process.env.OPENAI_API_KEY && process.env.SMARTDEVICES_AI_ENABLED === "true");
}

function outputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const object = payload as { output_text?: unknown; output?: unknown };
  if (typeof object.output_text === "string") return object.output_text;
  if (!Array.isArray(object.output)) return "";
  for (const item of object.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") return (part as { text: string }).text;
  }
  return "";
}

function outputCitations(payload: unknown): Array<{ title: string; url: string }> {
  const found = new Map<string, { title: string; url: string }>();
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { output?: unknown }).output)) return [];
  for (const item of (payload as { output: unknown[] }).output) {
    if (!item || typeof item !== "object" || !Array.isArray((item as { content?: unknown }).content)) continue;
    for (const part of (item as { content: unknown[] }).content) {
      if (!part || typeof part !== "object" || !Array.isArray((part as { annotations?: unknown }).annotations)) continue;
      for (const annotation of (part as { annotations: unknown[] }).annotations) {
        if (!annotation || typeof annotation !== "object") continue;
        const value = annotation as { url?: unknown; title?: unknown };
        if (typeof value.url === "string" && /^https:\/\//.test(value.url)) found.set(value.url, { title: typeof value.title === "string" ? value.title : value.url, url: value.url });
      }
    }
  }
  return [...found.values()].slice(0, 12);
}

function jsonFromText<T>(text: string): T | null {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(trimmed) as T; } catch { return null; }
}

async function callOpenAI(input: string, useWebSearch = false) {
  if (!configured()) throw new Error("AI_NOT_CONFIGURED");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.SMARTDEVICES_AI_MODEL || "gpt-5.6-terra",
        store: false,
        input,
        ...(useWebSearch ? { tools: [{ type: "web_search" }] } : {}),
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`AI_HTTP_${response.status}`);
    const payload = await response.json();
    const text = outputText(payload);
    if (!text) throw new Error("AI_EMPTY_RESPONSE");
    return { text, citations: outputCitations(payload), model: typeof (payload as { model?: unknown }).model === "string" ? (payload as { model: string }).model : (process.env.SMARTDEVICES_AI_MODEL || "gpt-5.6-terra") };
  } finally { clearTimeout(timeout); }
}

export async function orchestrateWithModel(idea: string, capability: BuildCapability, current: BuilderAnswers) {
  const fallback = deterministicOrchestrator(idea, capability, current);
  if (!configured()) return { orchestrator: { ...fallback, status: "model-unavailable" as const }, suggestedAnswers: {} as Partial<BuilderAnswers> };
  const prompt = `You are SmartDevices Builder's requirements orchestrator. Convert a physical-device idea into engineering requirements without inventing facts. Keep the first revision low-voltage and module-first. Do not provide implementation details for mains voltage, gas control, fire suppression, medical dosing, vehicle safety controls, weapons, or other life-safety functions.\n\nIDEA:\n${idea}\n\nCURRENT ANSWERS:\n${JSON.stringify(current)}\n\nINFERRED CAPABILITY: ${capability}\n\nReturn ONLY valid JSON with this exact top-level shape:\n{"summary":"string","inferredRequirements":["string"],"assumptions":["string"],"clarifyingQuestions":[{"id":"short-id","question":"string","whyItMatters":"string","suggestedAnswer":"optional string"}],"suggestedAnswers":{"environment":"indoor|garage|outdoor-sheltered|outdoor-exposed","power":"usb|replaceable-battery|either","connectivity":"wifi|bluetooth|local-only|not-sure","deploymentIntent":"auto|standalone|connected|mesh-ready|mesh-native","quantity":1|5|10|100,"goal":"proof-of-concept|functional-prototype|small-batch|product","budget":"under-30|30-75|75-150|flexible"}}\nAsk at most 5 clarifying questions and only questions that materially change hardware, firmware, enclosure, fleet identity, safety, or manufacturing.`;
  try {
    const result = await callOpenAI(prompt, false);
    const parsed = jsonFromText<{ summary?: unknown; inferredRequirements?: unknown; assumptions?: unknown; clarifyingQuestions?: unknown; suggestedAnswers?: Partial<BuilderAnswers> }>(result.text);
    if (!parsed || typeof parsed.summary !== "string") throw new Error("AI_INVALID_JSON");
    const questions = Array.isArray(parsed.clarifyingQuestions) ? parsed.clarifyingQuestions.filter((q): q is { id: string; question: string; whyItMatters: string; suggestedAnswer?: string } => Boolean(q && typeof q === "object" && typeof (q as { id?: unknown }).id === "string" && typeof (q as { question?: unknown }).question === "string" && typeof (q as { whyItMatters?: unknown }).whyItMatters === "string")).slice(0, 5) : fallback.clarifyingQuestions;
    const orchestrator: BuilderOrchestratorState = {
      status: "model-assisted",
      summary: parsed.summary,
      inferredRequirements: Array.isArray(parsed.inferredRequirements) ? parsed.inferredRequirements.filter((x): x is string => typeof x === "string").slice(0, 10) : fallback.inferredRequirements,
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions.filter((x): x is string => typeof x === "string").slice(0, 8) : fallback.assumptions,
      clarifyingQuestions: questions,
      model: result.model,
      generatedAt: new Date().toISOString(),
    };
    return { orchestrator, suggestedAnswers: parsed.suggestedAnswers && typeof parsed.suggestedAnswers === "object" ? parsed.suggestedAnswers : {} };
  } catch {
    return { orchestrator: { ...fallback, status: "model-unavailable" as const }, suggestedAnswers: {} as Partial<BuilderAnswers> };
  }
}

function validDecision(value: unknown): value is ResearchDecision { return ["buy", "adapt", "build", "research-more"].includes(String(value)); }

export async function researchWithModel(input: { idea: string; requirements: string[]; intelligenceMode: DeviceIntelligenceMode; planningCostUsd: number }): Promise<BuilderResearch> {
  const now = new Date().toISOString();
  if (!configured() || process.env.SMARTDEVICES_LIVE_RESEARCH_ENABLED !== "true") return { status: "unavailable", decision: "research-more", rationale: ["Live market research is not activated in this deployment."], candidates: [], sources: [], marketSummary: "Configure the approved research provider before treating the wider market as searched.", generatedAt: now };
  const prompt = `You are the live market-research layer for SmartDevices Builder. Research current commercial products and relevant open-source projects before SmartDevices commits to custom hardware. Prefer buying an existing product when it substantially satisfies the requirements. Prefer adapting an existing product/open design when that avoids unnecessary hardware engineering. Recommend build only when the custom requirements create meaningful differentiation.\n\nIDEA: ${input.idea}\nREQUIREMENTS: ${JSON.stringify(input.requirements)}\nINTELLIGENCE MODE: ${input.intelligenceMode}\nCURRENT PLANNING BOM COST: $${input.planningCostUsd.toFixed(2)}\n\nUse web search. Return ONLY valid JSON with this exact top-level shape:\n{"decision":"buy|adapt|build|research-more","rationale":["string"],"marketSummary":"string","candidates":[{"name":"string","manufacturer":"optional string","url":"https://... optional","estimatedPrice":"optional string","fit":"strong|partial|weak","notes":"string"}],"sources":[{"title":"string","url":"https://...","publisher":"optional string"}]}\nUse no more than 5 candidates and 8 sources. Never claim a product satisfies insurance/carrier requirements unless the cited primary source explicitly says so.`;
  try {
    const result = await callOpenAI(prompt, true);
    const parsed = jsonFromText<{ decision?: unknown; rationale?: unknown; marketSummary?: unknown; candidates?: unknown; sources?: unknown }>(result.text);
    if (!parsed || !validDecision(parsed.decision) || typeof parsed.marketSummary !== "string") throw new Error("RESEARCH_INVALID_JSON");
    const candidates = Array.isArray(parsed.candidates) ? parsed.candidates.filter((x): x is BuilderResearch["candidates"][number] => Boolean(x && typeof x === "object" && typeof (x as { name?: unknown }).name === "string" && ["strong", "partial", "weak"].includes(String((x as { fit?: unknown }).fit)) && typeof (x as { notes?: unknown }).notes === "string")).slice(0, 5) : [];
    const modelSources = Array.isArray(parsed.sources) ? parsed.sources.filter((x): x is BuilderResearch["sources"][number] => Boolean(x && typeof x === "object" && typeof (x as { title?: unknown }).title === "string" && typeof (x as { url?: unknown }).url === "string" && /^https:\/\//.test((x as { url: string }).url))).slice(0, 8) : [];
    const sourceMap = new Map<string, BuilderResearch["sources"][number]>();
    for (const item of result.citations) sourceMap.set(item.url, item);
    for (const item of modelSources) if (!sourceMap.has(item.url)) sourceMap.set(item.url, item);
    const sources = [...sourceMap.values()].slice(0, 8);
    return { status: "live", decision: parsed.decision, rationale: Array.isArray(parsed.rationale) ? parsed.rationale.filter((x): x is string => typeof x === "string").slice(0, 8) : [], candidates, sources, marketSummary: parsed.marketSummary, generatedAt: now, provider: `openai:${result.model}` };
  } catch {
    return { status: "unavailable", decision: "research-more", rationale: ["The configured live research provider did not return a usable result."], candidates: [], sources: [], marketSummary: "The project can continue with catalog research, but the wider market should be checked before fabrication.", generatedAt: now };
  }
}

export const builderAiConfigured = configured;
