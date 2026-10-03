import { handleBuilderRequest } from "@/app/lib/builder-route";
export const dynamic = "force-dynamic";
export function GET(request:Request) { return handleBuilderRequest(request); }
export const POST = GET;
