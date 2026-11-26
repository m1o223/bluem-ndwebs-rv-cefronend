import { NextRequest } from "next/server";
import { forwardReviewRequest } from "../../route";

export function POST(request: NextRequest) {
  return forwardReviewRequest(request, "/api/reviews/verification/send");
}
