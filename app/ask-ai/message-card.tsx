"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Markdown from "react-markdown";
import { Check, Copy, Pencil, Share2 } from "lucide-react";
import { messageCardText, type MessageCardContent } from "../lib/ai/message-card";
import styles from "./message-card.module.css";

const MessageEditor = dynamic(() => import("./message-card-editor"), { ssr: false });

function copyLabels() {
  const language = document.documentElement.lang.split("-")[0];
  if (language === "ar") return { success: "تم نسخ الرسالة", error: "تعذر النسخ. يرجى تحديد الرسالة ونسخها." };
  if (language === "sv") return { success: "Meddelandet kopierat", error: "Kunde inte kopiera. Markera och kopiera meddelandet." };
  return { success: "Message copied", error: "Could not copy. Please select and copy the message." };
}

export function MessageCard({ value, onSave, maxBodyLength = 11000 }: {
  value: MessageCardContent; onSave: (value: MessageCardContent) => void; maxBodyLength?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);

  function announce(error: boolean) {
    if (!alive.current) return;
    if (timer.current) clearTimeout(timer.current);
    const labels = copyLabels();
    setCopied(!error);
    setNotice({ text: error ? labels.error : labels.success, error });
    timer.current = setTimeout(() => { setNotice(null); setCopied(false); }, 2000);
  }

  async function copyOrShare(share: boolean) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      const text = messageCardText(value);
      if (share && typeof navigator.share === "function") {
        try { await navigator.share({ title: value.title, text }); return; }
        catch (error) { if (error instanceof Error && error.name === "AbortError") return; }
      }
      await navigator.clipboard.writeText(text);
      announce(false);
    } catch { announce(true); }
    finally { locked.current = false; if (alive.current) setBusy(false); }
  }

  function closeEditor() {
    setEditing(false);
    editButton.current?.focus();
  }

  return <>
    <section className={styles.card} aria-label="Message card">
      <header className={styles.header}>
        <span className={styles.label}>Message</span>
        <div className={styles.actions} role="group" aria-label="Message card actions">
          <button ref={editButton} type="button" aria-label="Edit message" title="Edit" aria-haspopup="dialog"
            onClick={() => setEditing(true)}><Pencil size={18} aria-hidden="true" /></button>
          <button type="button" aria-label="Copy message" title={copied ? "Copied" : "Copy"} disabled={busy}
            onClick={() => void copyOrShare(false)}>{copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}</button>
          <button type="button" aria-label="Share message" title="Share" disabled={busy}
            onClick={() => void copyOrShare(true)}><Share2 size={18} aria-hidden="true" /></button>
        </div>
      </header>
      <div className={styles.content}>
        <h2 className={styles.title} dir="auto">{value.title}</h2>
        <div className={styles.body} dir="auto">
          <Markdown components={{
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
            img: ({ alt }) => <span>{alt}</span>,
          }}>{value.body}</Markdown>
        </div>
      </div>
    </section>
    {editing && <MessageEditor value={value} maxBodyLength={maxBodyLength} onClose={closeEditor}
      onSave={next => { onSave(next); closeEditor(); }} />}
    {notice && createPortal(<div className={styles.toast} role={notice.error ? "alert" : "status"} dir="auto" data-no-translate>{notice.text}</div>, document.body)}
  </>;
}
