export function renderAiEndpoint(base = process.env.NEXT_PUBLIC_AI_API_BASE_URL): string | null {
  if (!base?.trim()) return null;
  try {
    const url = new URL(base.trim());
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(local && url.protocol === "http:"))) return null;
    return `${url.origin}/api/ai/chat`;
  } catch { return null; }
}
