import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";
import { catalogDeviceToSmartDeviceObject } from "@/app/lib/device-domain";
import { getDeviceCapability } from "@/app/lib/device-capabilities";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if ([...params.keys()].some((key) => !["capability", "slug"].includes(key)) || params.getAll("capability").length > 1 || params.getAll("slug").length > 1) return Response.json({ error: "INVALID_QUERY" }, { status: 400 });
  const capability = params.get("capability");
  if (capability !== null && !getDeviceCapability(capability)) return Response.json({ error: "UNKNOWN_CAPABILITY" }, { status: 400 });
  const { catalog } = await getPublishedEvidenceBundle();
  const devices = catalog.filter((item) => item.status === "active" && (!params.has("slug") || item.slug === params.get("slug"))).map(catalogDeviceToSmartDeviceObject).filter((item) => !capability || item.capabilities.some((binding) => binding.id === capability));
  return Response.json({ schemaVersion: 1, devices }, { headers: { "Cache-Control": "public, max-age=300" } });
}
