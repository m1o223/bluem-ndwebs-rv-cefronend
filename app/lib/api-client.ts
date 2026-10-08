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
  customerLanguage?: "en" | "sv" | "ar";
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

export type CareBillingInterval = "monthly" | "yearly";

export type CareCheckoutPayload = {
  planId: string;
  billingInterval: CareBillingInterval;
  orderNumber: string;
  customerEmail: string;
  checkoutAttemptId: string;
  emailVerificationToken: string;
  testMode?: boolean;
};

export type CareSubscription = {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail: string;
  planId: string;
  planName: string;
  billingInterval: CareBillingInterval;
  price: string;
  amountOre: number;
  currency: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  paidThroughDate?: string;
  nextRenewalDate?: string | null;
  cancelAtPeriodEnd: boolean;
  cancellation?: { reason?: string; reasonText?: string; requestedAt?: string; effectiveAt?: string };
  testMode?: boolean;
};

export type CareCheckoutResult =
  | { success: true; checkout: { checkoutUrl: string; sessionId: string; planId: string; planName: string; billingInterval: CareBillingInterval; amountOre: number; currency: string; testMode?: boolean } }
  | { success: false; error: string; fields?: Record<string, string> };

export type CareCheckoutStatus =
  | { success: true; status: string; sessionId?: string; subscription?: CareSubscription | null }
  | { success: false; error: string };

export type CareManageResult =
  | { success: true; email: string; subscriptions: CareSubscription[] }
  | { success: false; error: string; fields?: Record<string, string> };

export type CareCancelResult =
  | { success: true; subscription: CareSubscription; alreadyCancelled?: boolean }
  | { success: false; error: string; fields?: Record<string, string> };

export async function createCareStripeCheckout(payload: CareCheckoutPayload): Promise<CareCheckoutResult> {
  if (!API_BASE_URL) return { success: false, error: "Service is not configured yet. Please try again later." };
  try {
    const response = await fetch(`${API_BASE_URL}/api/care/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success !== true || !data?.checkout?.checkoutUrl) {
      return {
        success: false,
        error: typeof data?.error === "string" ? data.error : "We could not start BlueMind Care checkout. Please try again.",
        fields: data?.fields && typeof data.fields === "object" ? data.fields : undefined,
      };
    }
    return { success: true, checkout: data.checkout };
  } catch {
    return { success: false, error: "We could not reach the subscription service. Please check your connection and try again." };
  }
}

export async function getCareCheckoutStatus(sessionId: string): Promise<CareCheckoutStatus> {
  if (!API_BASE_URL) return { success: false, error: "Service is not configured yet. Please try again later." };
  try {
    const response = await fetch(`${API_BASE_URL}/api/care/stripe/sessions/${encodeURIComponent(sessionId)}`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success !== true) {
      return { success: false, error: typeof data?.error === "string" ? data.error : "We could not confirm this subscription yet." };
    }
    return data as CareCheckoutStatus;
  } catch {
    return { success: false, error: "We could not reach the subscription service. Please check your connection and try again." };
  }
}

export async function loadCareSubscriptions(payload: { email: string; checkoutAttemptId: string; emailVerificationToken: string }): Promise<CareManageResult> {
  return postJson<Extract<CareManageResult, { success: true }>>("/api/care/subscriptions/manage", payload, "We could not load your subscriptions. Please try again.") as Promise<CareManageResult>;
}

export async function cancelCareSubscription(payload: {
  email: string;
  checkoutAttemptId: string;
  emailVerificationToken: string;
  subscriptionId: string;
  reason: string;
  reasonText?: string;
}): Promise<CareCancelResult> {
  return postJson<Extract<CareCancelResult, { success: true }>>("/api/care/subscriptions/cancel", payload, "We could not update your subscription. Please try again.") as Promise<CareCancelResult>;
}
