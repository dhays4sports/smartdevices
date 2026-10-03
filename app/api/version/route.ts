import version from "@/app/generated/source-version.json";
import { HOSTING_ENVIRONMENT, PRIVATE_HEADERS } from "@/app/lib/hosting-policy";
export function GET() { return Response.json({ ...version, environment: HOSTING_ENVIRONMENT }, { headers: PRIVATE_HEADERS }); }
