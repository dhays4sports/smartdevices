import { canonicalCarrierHref, sanitizeCarrierRoute } from "@/app/lib/carrier-route";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search: Record<string, string | undefined> = {
    intent: url.searchParams.get("intent") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
  };
  return Response.redirect(new URL(canonicalCarrierHref(sanitizeCarrierRoute(search)), url.origin), 308);
}
