import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Customer } from "./routes";

export const CUSTOMER_COOKIE = "__Host-bluemind_customer";
export const CUSTOMER_TTL = 8 * 60 * 60;
export class CustomerSessionUnavailable extends Error {
  constructor() { super("Customer session verification is temporarily unavailable"); }
}
const RENDER = "https://bluemind-web-service-backend.onrender.com";
function backend() {
  const local = process.env.CUSTOMER_AUTH_BACKEND_URL;
  // Only the local test runner can use an isolated backend. Hosted builds always use Render.
  if (!process.env.VERCEL && local && /^http:\/\/127\.0\.0\.1:\d+$/.test(local)) return local;
  return RENDER;
}
export async function customerRequest(action: "login" | "session" | "logout" | "overview" | "messages" | "messages-read" | "message" | "profile" | "contact" | "password" | "google-start" | "google-callback", token?: string, body?: string, signal?: AbortSignal) {
  return fetch(`${backend()}/api/customer/${action}`, {
    method: action === "session" || action === "overview" || action === "messages" ? "GET" : "POST", cache: "no-store", redirect: "error",
    headers: { Origin: "https://bluemindwebservice.com", "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body, signal: AbortSignal.any([AbortSignal.timeout(15000), ...(signal ? [signal] : [])]),
  });
}
export function isCustomer(value: unknown): value is Customer {
  const user = value as Customer | null;
  return !!user && typeof user.id === "string" && typeof user.email === "string" && typeof user.displayName === "string";
}
export async function getCustomer() {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  try {
    const response = await customerRequest("session", token);
    if (response.status === 401) return null;
    if (!response.ok) throw new CustomerSessionUnavailable();
    const { user } = await response.json();
    if (!isCustomer(user)) throw new CustomerSessionUnavailable();
    return user;
  } catch { throw new CustomerSessionUnavailable(); }
}
export async function requireCustomer() {
  const user = await getCustomer();
  if (!user) redirect("/sign-in");
  return user;
}
