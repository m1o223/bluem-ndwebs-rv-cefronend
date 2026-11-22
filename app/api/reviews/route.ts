import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.CUSTOMER_AUTH_BACKEND_URL && !process.env.VERCEL
  ? process.env.CUSTOMER_AUTH_BACKEND_URL.replace(/\/$/, "")
  : "https://bluemind-web-service-backend.onrender.com";

async function forward(request: NextRequest) {
  const body = request.method === "POST" ? await request.text() : undefined;
  try {
    const response = await fetch(`${BACKEND}/api/reviews`, {
      method: request.method,
      headers: {
        Origin: "https://bluemindwebservice.com",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });
    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "We could not reach the review service. Please try again." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export function GET(request: NextRequest) {
  return forward(request);
}

export function POST(request: NextRequest) {
  return forward(request);
}
