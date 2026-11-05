"use client";
import { useState } from "react";
import { UserRound } from "lucide-react";

export default function ProfilePhoto({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);
  let safe = false;
  try { const url = new URL(src || ""); safe = url.protocol === "https:" && /^lh\d+\.googleusercontent\.com$/.test(url.hostname) && !url.username && !url.password && !url.port; } catch { /* Fall back to the existing icon. */ }
  // Google profile images bypass the server image optimizer; no arbitrary URL is fetched server-side.
  return safe && !failed ? <img src={src!} alt="" width={40} height={40} referrerPolicy="no-referrer" style={{ borderRadius: "50%", objectFit: "cover", maxWidth: "100%" }} onError={() => setFailed(true)} /> : <UserRound size={30} aria-hidden="true" />;
}
