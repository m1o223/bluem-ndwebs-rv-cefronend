"use client";
import { useEffect, useRef, useState } from "react";

export function useEmailSignIn() {
  const request = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "credentials" | "rate" | "unavailable">("idle");
  useEffect(() => () => request.current?.abort(), []);
  async function start(form: HTMLFormElement) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller; setStatus("loading");
    const values = new FormData(form);
    values.set("customerType", form.querySelector("select")?.value || "");
    try {
      const response = await fetch("/api/customer/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]), body: JSON.stringify({ email: values.get("email"), password: values.get("password"), customerType: values.get("customerType") }) });
      if (controller.signal.aborted) return;
      if (!response.ok) { setStatus(response.status === 401 || response.status === 400 ? "credentials" : response.status === 429 ? "rate" : "unavailable"); return; }
      const result = await response.json();
      if (!result.user?.id) throw new Error("invalid");
      form.reset(); setStatus("success");
      window.location.replace("/dashboard");
    } catch { if (!controller.signal.aborted) setStatus("unavailable"); }
    finally { if (!controller.signal.aborted) request.current = null; }
  }
  return { start, status, busy: status === "loading" || status === "success", reset: () => { if (!request.current) setStatus("idle"); } };
}
