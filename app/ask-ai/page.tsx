import ChatWorkspace from "./chat-workspace";

export default function AskAiPage() {
  return <ChatWorkspace preview={process.env.VERCEL_ENV !== "production"} />;
}
