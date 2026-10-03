import { deviceCapabilities } from "@/app/lib/device-capabilities";

export async function GET() {
  return Response.json({ schemaVersion: 1, capabilities: deviceCapabilities }, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
