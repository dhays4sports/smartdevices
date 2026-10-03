import { handleBuilderRequest } from "@/app/lib/builder-route";
type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function GET(request:Request,{params}:Props) { return handleBuilderRequest(request,(await params).id); }
export const PUT = GET;
