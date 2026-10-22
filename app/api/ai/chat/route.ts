import { NextRequest } from "next/server";
import { proxyAi } from "../../../lib/ai/owner-proxy";
export const runtime = "nodejs";
export const maxDuration = 60;
export const POST = (request: NextRequest) => proxyAi(request, false);
