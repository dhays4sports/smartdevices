/** This continuation is an isolated test release. Production needs a reviewed policy change. */
export const HOSTING_ENVIRONMENT = "isolated-sites-test";
export const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", "Vary": "Cookie, oai-authenticated-user-id", "X-Robots-Tag": "noindex, nofollow" };
export function sameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin && request.headers.get("sec-fetch-site") !== "cross-site";
}
export function hostingBoundary(request: Request): Response | null {
  let path: string;
  try { path = decodeURIComponent(new URL(request.url).pathname); } catch { return new Response(null, { status: 400, headers: PRIVATE_HEADERS }); }
  const read = ["GET", "HEAD"].includes(request.method);
  const projects = /^\/api\/builder\/projects(?:\/sd-[a-z0-9-]{6,80})?$/.test(path);
  const restore = path === "/api/builder/restore";
  const exportRoute = path === "/api/builder/export";
  const publicRead = ["/api/devices", "/api/capabilities", "/api/version"].includes(path) || /^\/api\/devices\/[a-z0-9-]+$/.test(path) && path!=="/api/devices/register";
  const permitted = path.startsWith("/api/") ? (read ? projects || exportRoute || publicRead : (projects && ["POST", "PUT"].includes(request.method)) || (restore && request.method === "POST")) : read && !path.startsWith("/admin") && !path.startsWith("/_vinext/image");
  if (!permitted) return Response.json({ error: { code: "TEST_ENVIRONMENT_BLOCKED", message: "Only Builder persistence is enabled. Live devices, external services, payments and other writes are disabled." } }, { status: 403, headers: PRIVATE_HEADERS });
  if (!read && !sameOriginMutation(request)) return Response.json({ error: { code: "ORIGIN_REJECTED", message: "Use this application's own page to save." } }, { status: 403, headers: PRIVATE_HEADERS });
  return null;
}
