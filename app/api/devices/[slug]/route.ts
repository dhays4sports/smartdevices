import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";
import { catalogDeviceToSmartDeviceObject } from "@/app/lib/device-domain";
import { jsonError } from "@/app/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const bundle = await getPublishedEvidenceBundle();
  const device = bundle.catalog.find((item) => item.slug === slug && item.status === "active");
  if (!device) return jsonError(404, "NOT_FOUND", "Device record not found.");
  return Response.json({ device: catalogDeviceToSmartDeviceObject(device) }, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
}
