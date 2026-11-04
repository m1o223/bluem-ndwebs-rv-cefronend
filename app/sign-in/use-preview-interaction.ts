"use client";

import { useEffect, useRef, useState } from "react";

type PreviewAction = "email" | "google" | "bankid" | "recovery";
type Feedback = { action: PreviewAction; phase: "loading" | "settled" } | null;

// Presentation only: this hook never accepts credentials or creates a session.
export function usePreviewInteraction() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function preview(action: PreviewAction, onComplete?: () => void) {
    if (pending.current) return;
    if (timer.current) clearTimeout(timer.current);
    pending.current = true;
    setFeedback({ action, phase: "loading" });
    timer.current = setTimeout(() => {
      if (onComplete) {
        // Keep the control locked until navigation unmounts this screen.
        onComplete();
        return;
      }
      pending.current = false;
      setFeedback({ action, phase: "settled" });
      timer.current = setTimeout(() => setFeedback(null), 1600);
    }, 900);
  }

  return { feedback, preview, busy: feedback?.phase === "loading" };
}
