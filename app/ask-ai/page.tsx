import ChatWorkspace from "./chat-workspace";
import { aiAvailable } from "../lib/ai/server";

export const dynamic = "force-dynamic";

export default function AskAiPage() {
  return <ChatWorkspace available={aiAvailable()} />;
}
