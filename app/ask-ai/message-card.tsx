"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Copy, Pencil, Share2 } from "lucide-react";
import { messageCardText, type MessageCardContent } from "../lib/ai/message-card";
import styles from "./message-card.module.css";

export function MessageCard({ value, onSave, maxBodyLength = 11000, theme = "auto" }: {
  value: MessageCardContent; onSave: (value: MessageCardContent) => void;
  maxBodyLength?: number; theme?: "auto" | "light" | "dark";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const id = useId();
  const current = editing ? draft : value;
  const valid = Boolean(draft.title.trim() && draft.body.trim())
    && draft.title.length <= 200 && draft.body.length <= maxBodyLength;

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(() => { if (editing) titleInput.current?.focus(); }, [editing]);

  function announce(text: string) {
    if (!alive.current) return;
    if (timer.current) clearTimeout(timer.current);
    setNotice(text);
    timer.current = setTimeout(() => setNotice(""), 3000);
  }

  async function copyOrShare(share: boolean) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    const text = messageCardText(current);
    try {
      if (share && typeof navigator.share === "function") {
        try { await navigator.share({ title: current.title, text }); return; }
        catch (error) { if (error instanceof Error && error.name === "AbortError") return; }
      }
      await navigator.clipboard.writeText(text);
      announce(share ? "Message copied for sharing." : "Message copied.");
    } catch { announce("Could not copy. Please select and copy the message."); }
    finally { locked.current = false; if (alive.current) setBusy(false); }
  }

  function save() {
    if (!valid) return;
    const next = { title: draft.title.trim(), body: draft.body.trim() };
    onSave(next);
    setDraft(next);
    setEditing(false);
    announce("Changes saved.");
    editButton.current?.focus();
  }

  return <section className={styles.card} data-theme={theme} aria-label="Message card">
    <header className={styles.header}>
      <span className={styles.label}>Message</span>
      <div className={styles.actions} role="group" aria-label="Message card actions">
        <button ref={editButton} type="button" aria-label="Edit message" title="Edit" aria-expanded={editing} aria-controls={id}
          onClick={() => { if (editing) save(); else { setDraft(value); setEditing(true); } }}><Pencil size={18} aria-hidden="true" /></button>
        <button type="button" aria-label="Copy message" title="Copy" disabled={busy} onClick={() => void copyOrShare(false)}><Copy size={18} aria-hidden="true" /></button>
        <button type="button" aria-label="Share message" title="Share" disabled={busy} onClick={() => void copyOrShare(true)}><Share2 size={18} aria-hidden="true" /></button>
      </div>
    </header>
    <div id={id} className={styles.content}>
      {editing ? <form className={styles.editor} onSubmit={event => { event.preventDefault(); save(); }}>
        <label htmlFor={`${id}-title`}>Title</label>
        <input ref={titleInput} id={`${id}-title`} dir="auto" required maxLength={200} value={draft.title}
          onChange={event => setDraft(previous => ({ ...previous, title: event.target.value }))} />
        <label htmlFor={`${id}-body`}>Message body</label>
        <textarea id={`${id}-body`} dir="auto" required maxLength={maxBodyLength} rows={10} value={draft.body}
          onChange={event => setDraft(previous => ({ ...previous, body: event.target.value }))} />
        <button className={styles.save} type="submit" disabled={!valid}>Save changes</button>
      </form> : <>
        <h2 className={styles.title} dir="auto">{value.title}</h2>
        <div className={styles.body} dir="auto">{value.body}</div>
      </>}
      <div className={styles.notice} role="status">{notice}</div>
    </div>
  </section>;
}
