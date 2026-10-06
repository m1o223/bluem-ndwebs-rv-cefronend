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
