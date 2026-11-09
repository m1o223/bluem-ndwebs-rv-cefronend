import { NextRequest } from "next/server";
import { proxyConversations } from "../../../../lib/ai/proxy";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, context: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await context.params;
  return proxyConversations(request, `/${encodeURIComponent(conversationId)}`);
}
