"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./customer.module.css";

type SavedConversation = {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string | null;
};

function dateLabel(value: string | null) {
  if (!value) return "";
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  catch { return ""; }
}

export default function AccountAiConversations() {
  const [items, setItems] = useState<SavedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/ai/conversations", { credentials: "same-origin", cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("conversations");
        const value = await response.json();
        const rows = Array.isArray(value.conversations) ? value.conversations.filter((item: unknown): item is SavedConversation => {
          if (!item || typeof item !== "object") return false;
          const row = item as SavedConversation;
          return typeof row.id === "string" && typeof row.title === "string";
        }) : [];
        if (active) setItems(rows);
      })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <section className={styles.section} aria-labelledby="account-conversations-title">
    <div className={styles.sectionHeading}>
      <div>
        <h2 id="account-conversations-title">Your account conversations</h2>
        <p className={styles.muted}>Continue a saved BlueMind AI conversation from where you left off.</p>
      </div>
      <MessageSquare size={22} aria-hidden="true" />
    </div>
    {loading && <div className={styles.conversationLoading} role="status"><LoaderCircle size={18} className={styles.spinner} aria-hidden="true" /> Loading conversations</div>}
    {!loading && failed && <p className={styles.error} role="alert">Conversations are temporarily unavailable. Please try again.</p>}
    {!loading && !failed && !items.length && <div className={styles.empty}><MessageSquare size={28} strokeWidth={1.5} aria-hidden="true" /><p>No saved conversations yet. Start a conversation with BlueMind AI to see it here.</p></div>}
    {!loading && !failed && items.length > 0 && <div className={styles.aiConversationList}>
      {items.map(item => <Link className={styles.aiConversationItem} key={item.id} href={`/ask-ai?conversation=${encodeURIComponent(item.id)}`}>
        <span className={styles.aiConversationIcon}><MessageSquare size={18} aria-hidden="true" /></span>
        <span className={styles.aiConversationCopy}><strong>{item.title || "BlueMind AI conversation"}</strong><small>{item.messageCount || 0} messages{item.updatedAt ? ` · ${dateLabel(item.updatedAt)}` : ""}</small></span>
        <ArrowRight size={17} aria-hidden="true" />
      </Link>)}
    </div>}
  </section>;
}
