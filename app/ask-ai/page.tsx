import ChatWorkspace from "./chat-workspace";
import { renderAiEndpoint } from "../lib/ai/endpoint";

export const dynamic = "force-dynamic";

export default function AskAiPage() {
  return <ChatWorkspace available={Boolean(renderAiEndpoint())} />;
}
