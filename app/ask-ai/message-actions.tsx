"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, RefreshCw, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import styles from "./chat-workspace.module.css";
import cardStyles from "./message-card.module.css";

export type Feedback = "like" | "dislike" | undefined;

export function MessageActions({ text, feedback, generating, onFeedback, onRegenerate }: {
  text: string; feedback: Feedback; generating: boolean;
  onFeedback: (feedback: Feedback) => void; onRegenerate: () => void;
}) {
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);

  function announce(message: string, copiedText = false) {
    if (!mounted.current) return;
    if (timer.current) clearTimeout(timer.current);
    setNotice(message);
    setCopied(copiedText);
    timer.current = setTimeout(() => { setNotice(""); setCopied(false); }, 2500);
  }

  async function copyOrShare(share: boolean) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      if (share && typeof navigator.share === "function") {
        try {
          await navigator.share({ title: "BlueMind AI response", text });
          return;
        } catch (error) {
          // Closing the native share sheet is not a request to copy the response.
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }
      await navigator.clipboard.writeText(text);
      announce(share ? "Response copied for sharing." : "Copied!", true);
    } catch {
      announce("Could not copy. Please select and copy the response.");
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return <div className={styles.responseActions}>
    <div className={styles.actionButtons} role="group" aria-label="Response actions">
      <button type="button" aria-label="Like response" aria-pressed={feedback === "like"} data-tooltip="Like"
        onClick={() => onFeedback(feedback === "like" ? undefined : "like")}><ThumbsUp size={17} aria-hidden="true" /></button>
      <button type="button" aria-label="Dislike response" aria-pressed={feedback === "dislike"} data-tooltip="Dislike"
        onClick={() => onFeedback(feedback === "dislike" ? undefined : "dislike")}><ThumbsDown size={17} aria-hidden="true" /></button>
      <button type="button" aria-label="Copy response" data-tooltip={copied ? "Copied!" : "Copy"} disabled={busy}
        onClick={() => void copyOrShare(false)}>{copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}</button>
      <button type="button" aria-label="Share response" data-tooltip="Share" disabled={busy}
        onClick={() => void copyOrShare(true)}><Share2 size={17} aria-hidden="true" /></button>
      <button type="button" aria-label="Regenerate response" data-tooltip={generating ? "Wait for the current response" : "Regenerate"}
        disabled={generating} onClick={onRegenerate}><RefreshCw size={17} aria-hidden="true" /></button>
    </div>
    {notice && createPortal(<div className={cardStyles.toast} role="status" data-no-translate>{notice}</div>, document.body)}
  </div>;
}
