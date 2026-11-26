import { NextRequest } from "next/server";
import { forwardReviewRequest } from "../../reviews/route";

export function POST(request: NextRequest) {
  return forwardReviewRequest(request, "/api/order-email-verification/send");
}
