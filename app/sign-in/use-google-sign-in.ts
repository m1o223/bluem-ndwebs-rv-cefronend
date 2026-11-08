"use client";

import { useEffect, useRef, useState } from "react";

export function useGoogleSignIn() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("google");
    if (["cancelled", "failed", "unavailable", "link_required"].includes(value || "")) setError(value!);
    return () => { pending.current?.abort(); pending.current = null; };
  }, []);
  async function start(customerType: string) {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true); setError("");
    try {
      const query = ["private", "company"].includes(customerType) ? `?customerType=${customerType}` : "";
      const response = await fetch(`/api/auth/google${query}`, { method: "POST", credentials: "same-origin", cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) });
      if (!response.ok) throw new Error("unavailable");
      const { authorizationUrl } = await response.json();
      const url = new URL(authorizationUrl);
      if (url.origin !== "https://accounts.google.com" || url.pathname !== "/o/oauth2/v2/auth") throw new Error("unavailable");
      if (!controller.signal.aborted) window.location.assign(url.href);
    } catch {
      if (!controller.signal.aborted) { setError("unavailable"); setBusy(false); pending.current = null; }
    }
  }
  return { busy, error, start, clearError: () => { if (!pending.current) setError(""); } };
}
