"use client";
import { useEffect, useState } from "react";
export default function ConnectivityTest() {
  const [status, setStatus] = useState("Checking");
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    async function checkHealth() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!base) throw new Error("Backend URL is not configured");
        const url = new URL(base);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid backend URL");
        const response = await fetch(`${base.replace(/\/$/, "")}/api/health`, {
          signal: controller.signal, cache: "no-store", credentials: "omit",
        });
        const data = await response.json();
        if (!response.ok || data.success !== true || data.service !== "BlueMind Web Service API" || data.status !== "healthy") {
          throw new Error("Invalid health response");
        }
        setStatus("Connected");
      } catch {
        setStatus("Failed");
      } finally {
        clearTimeout(timeout);
      }
    }
    void checkHealth();
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);
  return <main><h1>BlueMind Web Service</h1><p>Frontend is running</p><p role="status">Backend connection status: {status}</p></main>;
}
