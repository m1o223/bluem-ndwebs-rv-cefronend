import { NextRequest } from "next/server";
import { proxyConversations } from "../../../lib/ai/proxy";

export const dynamic = "force-dynamic";
export const GET = (request: NextRequest) => proxyConversations(request);
