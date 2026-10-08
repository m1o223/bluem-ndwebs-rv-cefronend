const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export type ApiResult = { success: true; message: string } | { success: false; error?: string; fields?: Record<string, string> };

export async function postApi(path: "/api/contact" | "/api/quote", payload: Record<string, string | undefined>): Promise<ApiResult> {
  if (!API_BASE_URL) {
    return { success: false, error: "Service is not configured yet. Please try again later." };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success !== true) {
      return {
        success: false,
        error: typeof data?.error === "string" ? data.error : "We could not send your request. Please try again.",
        fields: data?.fields && typeof data.fields === "object" ? data.fields : undefined
      };
    }
    return { success: true, message: typeof data.message === "string" ? data.message : "Request received successfully." };
  } catch {
    return { success: false, error: "We could not reach the service. Please check your connection and try again." };
  } finally {
    window.clearTimeout(timeout);
  }
}

export type EmailVerificationSendResult =
  | { success: true; message: string; verification: { email: string; checkoutAttemptId: string; expiresInSeconds: number; resendAfterSeconds: number } }
  | { success: false; error: string; fields?: Record<string, string> };

export type EmailVerificationVerifyResult =
  | { success: true; message: string; verification: { email: string; checkoutAttemptId: string; verificationToken: string; tokenExpiresInSeconds: number } }
  | { success: false; error: string; fields?: Record<string, string> };

async function postJson<T>(path: string, payload: Record<string, unknown>, fallback: string): Promise<T | { success: false; error: string; fields?: Record<string, string> }> {
  if (!API_BASE_URL) return { success: false, error: "Service is not configured yet. Please try again later." };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success !== true) {
      return {
        success: false,
        error: typeof data?.error === "string" ? data.error : fallback,
        fields: data?.fields && typeof data.fields === "object" ? data.fields : undefined,
      };
    }
    return data as T;
  } catch {
    return { success: false, error: "We could not reach the service. Please check your connection and try again." };
  }
}

export async function sendEmailVerificationCode(payload: { email: string; checkoutAttemptId: string; language: "en" | "sv" | "ar" }): Promise<EmailVerificationSendResult> {
  return postJson<Extract<EmailVerificationSendResult, { success: true }>>("/api/order-email-verification/send", payload, "We could not send the verification code. Please try again.") as Promise<EmailVerificationSendResult>;
}

export async function verifyEmailVerificationCode(payload: { email: string; checkoutAttemptId: string; code: string }): Promise<EmailVerificationVerifyResult> {
  return postJson<Extract<EmailVerificationVerifyResult, { success: true }>>("/api/order-email-verification/verify", payload, "We could not verify the code. Please try again.") as Promise<EmailVerificationVerifyResult>;
}

export type StripeCheckoutPayload = {
  packageId: string;
  paymentOption: "full" | "deposit";
  customerName: string;
  verifiedEmail: string;
  checkoutAttemptId: string;
  emailVerificationToken: string;
  companyName?: string;
  phone?: string;
  projectDescription: string;
  requestedFeatures: string[];
  websiteDetails: Record<string, string>;
};

export type StripeCheckoutResult =
  | { success: true; checkout: { checkoutUrl: string; sessionId: string; amountDueNowOre: number; remainingBalanceOre: number; totalAmountOre: number; currency: string } }
  | { success: false; error: string; fields?: Record<string, string> };

export type StripeCheckoutStatus =
  | { success: true; status: string; sessionId?: string; order?: { orderNumber: string; packageName?: string; email?: string; paymentStatus?: string; projectStatus?: string; amountPaidOre?: number; remainingBalanceOre?: number; totalAmountOre?: number } | null; amounts?: { total: string; paid: string; remaining: string } }
  | { success: false; error: string };

export async function createStripeCheckout(payload: StripeCheckoutPayload): Promise<StripeCheckoutResult> {
  if (!API_BASE_URL) return { success: false, error: "Service is not configured yet. Please try again later." };

  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success !== true || !data?.checkout?.checkoutUrl) {
      return {
        success: false,
        error: typeof data?.error === "string" ? data.error : "We could not start Stripe Checkout. Please try again.",
        fields: data?.fields && typeof data.fields === "object" ? data.fields : undefined,
      };
    }
    return { success: true, checkout: data.checkout };
  } catch {
    return { success: false, error: "We could not reach the payment service. Please check your connection and try again." };
  }
}

export async function getStripeCheckoutStatus(sessionId: string): Promise<StripeCheckoutStatus> {
  if (!API_BASE_URL) return { success: false, error: "Service is not configured yet. Please try again later." };

  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/stripe/sessions/${encodeURIComponent(sessionId)}`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success !== true) {
      return { success: false, error: typeof data?.error === "string" ? data.error : "We could not confirm this checkout yet." };
    }
    return data as StripeCheckoutStatus;
  } catch {
    return { success: false, error: "We could not reach the payment service. Please check your connection and try again." };
  }
}
