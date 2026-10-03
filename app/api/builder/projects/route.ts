import { getChatGPTUser } from "@/app/chatgpt-auth";
import { jsonError } from "@/app/lib/api";
import { listHostedProjects, MAX_BUILDER_PROJECT_BYTES, saveHostedProject, validateDeviceProject } from "@/app/lib/builder-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";

async function readProject(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new Error("CONTENT_TYPE");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BUILDER_PROJECT_BYTES) throw new Error("PROJECT_TOO_LARGE");
  return validateDeviceProject(JSON.parse(text));
}

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return jsonError(401, "AUTHENTICATION_REQUIRED", "Sign in to view hosted Builder projects.");
  try {
    const rate = await consumeRateLimit(request, "builder:projects:list", 60, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Project listing is temporarily unavailable.");
    return Response.json({ projects: await listHostedProjects(user.email) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return jsonError(503, "STORAGE_UNAVAILABLE", "Hosted Builder project storage is not activated in this environment."); }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return jsonError(401, "AUTHENTICATION_REQUIRED", "Sign in to save a hosted Builder project.");
  try {
    const rate = await consumeRateLimit(request, "builder:projects:save", 30, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Project saving is temporarily unavailable.");
    const saved = await saveHostedProject(await readProject(request), user.email);
    return Response.json({ project: saved, url: `/project/${saved.id}` }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_PROJECT";
    const status = code === "NOT_AUTHORIZED" ? 403 : code.includes("D1") ? 503 : code === "PROJECT_TOO_LARGE" ? 413 : 400;
    return jsonError(status, code, status === 503 ? "Hosted Builder project storage is not activated in this environment." : "The Builder project could not be saved.");
  }
}
