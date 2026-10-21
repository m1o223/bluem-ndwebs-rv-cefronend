import { createChatHandler } from "../../../lib/ai/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const POST = createChatHandler();
