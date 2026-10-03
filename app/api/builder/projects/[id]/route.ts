import { getChatGPTUser } from "@/app/chatgpt-auth";
import { jsonError } from "@/app/lib/api";
import { MAX_BUILDER_PROJECT_BYTES, readHostedProject, saveHostedProject, validateDeviceProject } from "@/app/lib/builder-store";
import { consumeRateLimit } from "@/app/lib/rate-limit";

type Props = { params: Promise<{ id: string }> };
const validId = (id: string) => /^sd-[a-z0-9-]{6,80}$/i.test(id);

export async function GET(request: Request, { params }: Props) {
  const user = await getChatGPTUser();
  if (!user) return jsonError(401, "AUTHENTICATION_REQUIRED", "Sign in to view this Builder project.");
  const { id } = await params;
  if (!validId(id)) return jsonError(404, "NOT_FOUND", "Project not found.");
  try {
    const rate = await consumeRateLimit(request, "builder:projects:read", 120, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Project reading is temporarily unavailable.");
    const project = await readHostedProject(id, user.email);
    if (!project) return jsonError(404, "NOT_FOUND", "Project not found.");
    return Response.json({ project }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return jsonError(503, "STORAGE_UNAVAILABLE", "Hosted Builder project storage is not activated in this environment."); }
}

export async function PUT(request: Request, { params }: Props) {
  const user = await getChatGPTUser();
  if (!user) return jsonError(401, "AUTHENTICATION_REQUIRED", "Sign in to update this Builder project.");
  const { id } = await params;
  if (!validId(id)) return jsonError(404, "NOT_FOUND", "Project not found.");
  try {
    const rate = await consumeRateLimit(request, "builder:projects:update", 40, 60);
    if (!rate.allowed) return jsonError(rate.reason === "RATE_LIMITED" ? 429 : 503, rate.reason, "Project updates are temporarily unavailable.");
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new Error("CONTENT_TYPE");
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BUILDER_PROJECT_BYTES) throw new Error("PROJECT_TOO_LARGE");
    const project = validateDeviceProject(JSON.parse(text));
    if (project.id !== id) throw new Error("PROJECT_ID_MISMATCH");
    const saved = await saveHostedProject(project, user.email);
    return Response.json({ project: saved, url: `/project/${saved.id}` }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_PROJECT";
    const status = code === "NOT_AUTHORIZED" ? 403 : code.includes("D1") ? 503 : code === "PROJECT_TOO_LARGE" ? 413 : 400;
    return jsonError(status, code, status === 503 ? "Hosted Builder project storage is not activated in this environment." : "The Builder project could not be updated.");
  }
}
