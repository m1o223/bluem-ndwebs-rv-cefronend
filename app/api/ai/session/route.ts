import { NextRequest } from "next/server";
import { proxyAi } from "../../../lib/ai/owner-proxy";
export const runtime = "nodejs";
export const maxDuration = 20;
export const POST = (request: NextRequest) => proxyAi(request, true);
export const GET = (request: NextRequest) => proxyAi(request, true);
export const DELETE = (request: NextRequest) => proxyAi(request, true);
