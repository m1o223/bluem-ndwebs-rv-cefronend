import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const configuredBackend = process.env.CUSTOMER_AUTH_BACKEND_URL?.replace(/\/$/, "");
const testBackend = process.env.TEST_REVIEWS_BACKEND_URL?.replace(/\/$/, "");
const testSite = process.env.NEXT_PUBLIC_TEST_SITE === "true"
  || process.env.TEST_SITE === "true"
  || process.env.VERCEL_ENV === "preview"
  || process.env.VERCEL_GIT_COMMIT_REF === "test";
const BACKEND = testSite ? testBackend : (configuredBackend && !process.env.VERCEL
  ? configuredBackend
  : "https://bluemind-web-service-backend.onrender.com");
const CUSTOMER_COOKIE = "__Host-bluemind_customer";
const GUEST_COOKIE = process.env.NODE_ENV === "production" ? "__Host-bluemind_review_guest" : "bluemind_review_guest";
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const GUEST_TTL = 60 * 60 * 24 * 365;

function testBackendUnavailable(request: NextRequest) {
  if (request.method === "GET") {
    return NextResponse.json({ success: true, reviews: [] }, { headers: { "Cache-Control": "no-store, private" } });
  }
  return NextResponse.json(
    { success: false, error: "Review service is not connected to Test data yet." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function forwardReviewRequest(request: NextRequest, backendPath = "/api/reviews") {
  if (testSite && !BACKEND) return testBackendUnavailable(request);
  const body = ["POST", "PATCH"].includes(request.method) ? await request.text() : undefined;
  const guestCookie = request.cookies.get(GUEST_COOKIE)?.value || "";
  const guestToken = TOKEN_PATTERN.test(guestCookie) ? guestCookie : randomBytes(32).toString("hex");
  const customerToken = request.cookies.get(CUSTOMER_COOKIE)?.value || "";
  try {
    const response = await fetch(`${BACKEND}${backendPath}`, {
      method: request.method,
      headers: {
        Origin: "https://bluemindwebservice.com",
        ...(TOKEN_PATTERN.test(customerToken) ? { Authorization: `Bearer ${customerToken}` } : {}),
        "x-review-guest-token": guestToken,
        ...(request.headers.get("x-review-idempotency-key") ? { "x-review-idempotency-key": request.headers.get("x-review-idempotency-key")! } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });
    const payload = await response.text();
    const result = new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
    if (!TOKEN_PATTERN.test(guestCookie)) result.cookies.set(GUEST_COOKIE, guestToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: GUEST_TTL, path: "/" });
    return result;
  } catch {
    const result = NextResponse.json({ success: false, error: "We could not reach the review service. Please try again." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    if (!TOKEN_PATTERN.test(guestCookie)) result.cookies.set(GUEST_COOKIE, guestToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: GUEST_TTL, path: "/" });
    return result;
  }
}

export function GET(request: NextRequest) {
  return forwardReviewRequest(request);
}

export function POST(request: NextRequest) {
  return forwardReviewRequest(request);
}

export function PATCH(request: NextRequest) {
  return forwardReviewRequest(request);
}
