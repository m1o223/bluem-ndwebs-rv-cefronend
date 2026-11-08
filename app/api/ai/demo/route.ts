import { NextRequest, NextResponse } from "next/server";
import { proxyAi } from "../../../lib/ai/proxy";

export const runtime = "nodejs";
export const maxDuration = 60;

const COOKIE = "bluemind-ai-demo";
const MAX_MESSAGES = 2;
type DemoState = { completed: number; inFlight: number };
const states = new Map<string, DemoState>();

function sessionId(value: string | undefined) {
  return value && /^[0-9a-f-]{36}$/.test(value) ? value : crypto.randomUUID();
}

function setSession(response: NextResponse, id: string) {
  response.cookies.set(COOKIE, id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 3600 });
  return response;
}

function json(code: string, status: number, id: string) {
  return setSession(NextResponse.json({ code }, { status, headers: { "Cache-Control": "no-store" } }), id);
}

export async function POST(request: NextRequest) {
  const id = sessionId(request.cookies.get(COOKIE)?.value);
  const state = states.get(id) ?? { completed: 0, inFlight: 0 };
  states.set(id, state);
  if (state.completed + state.inFlight >= MAX_MESSAGES) return json("demo_limit", 429, id);
  state.inFlight += 1;

  let settled = false;
  const finish = (success: boolean) => {
    if (settled) return;
    settled = true;
    state.inFlight = Math.max(0, state.inFlight - 1);
    if (success) state.completed += 1;
  };

  let upstream: Response;
  try {
    upstream = await proxyAi(request);
  } catch {
    finish(false);
    return json("unavailable", 503, id);
  }
  if (!upstream.ok || !upstream.body) {
    finish(false);
    return setSession(new NextResponse(upstream.body, { status: upstream.status, headers: upstream.headers }), id);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const chunk = await reader.read();
        if (chunk.done) {
          finish(completed);
          controller.close();
          return;
        }
        buffer += decoder.decode(chunk.value, { stream: true });
        let newline = -1;
        while ((newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (!line) continue;
          try { if (JSON.parse(line)?.type === "done") completed = true; } catch { /* proxy validates event shape */ }
        }
        controller.enqueue(chunk.value);
      } catch (error) {
        finish(false);
        controller.error(error);
      }
    },
    cancel(reason) {
      void reader.cancel(reason).catch(() => {});
      finish(false);
    },
  });
  return setSession(new NextResponse(stream, { status: upstream.status, headers: upstream.headers }), id);
}
