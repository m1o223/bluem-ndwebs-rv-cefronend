"use client";

import Image from "next/image";
import { ArrowLeft, Clock3, Mail, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Locale } from "../localization-provider";
import styles from "./customer.module.css";

type TeamMessage = {
  id: string;
  sender: "team" | "customer";
  body: string;
  createdAt: string | null;
  orderNumber?: string | null;
  read: boolean;
};

type Copy = {
  title: string;
  teamName: string;
  listHint: string;
  emptyList: string;
  start: string;
  emptyConversation: string;
  back: string;
  placeholder: string;
  send: string;
  sending: string;
  sendFailed: string;
  loading: string;
  loadFailed: string;
  retry: string;
  newLabel: string;
  order: string;
  team: string;
  you: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    title: "Messages", teamName: "BlueMind Web Service Team", listHint: "Project updates and your conversation with the team", emptyList: "No messages yet.", start: "Start a conversation", emptyConversation: "Write to the team to start your conversation.", back: "Back to messages", placeholder: "Write your message...", send: "Send", sending: "Sending...", sendFailed: "Your message was not sent. Your text is still here so you can try again.", loading: "Loading messages...", loadFailed: "Messages could not be loaded.", retry: "Try again", newLabel: "New", order: "Order", team: "BlueMind Web Service Team", you: "You",
  },
  sv: {
    title: "Meddelanden", teamName: "BlueMind Web Service Team", listHint: "Projektuppdateringar och din konversation med teamet", emptyList: "Inga meddelanden ännu.", start: "Starta en konversation", emptyConversation: "Skriv till teamet för att starta din konversation.", back: "Tillbaka till meddelanden", placeholder: "Skriv ditt meddelande...", send: "Skicka", sending: "Skickar...", sendFailed: "Ditt meddelande skickades inte. Texten finns kvar så att du kan försöka igen.", loading: "Läser meddelanden...", loadFailed: "Meddelandena kunde inte läsas.", retry: "Försök igen", newLabel: "Ny", order: "Order", team: "BlueMind Web Service Team", you: "Du",
  },
  ar: {
    title: "\u0627\u0644\u0631\u0633\u0627\u0626\u0644", teamName: "BlueMind Web Service Team", listHint: "\u062a\u062d\u062f\u064a\u062b\u0627\u062a \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0648\u0645\u062d\u0627\u062f\u062b\u062a\u0643 \u0645\u0639 \u0627\u0644\u0641\u0631\u064a\u0642", emptyList: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0633\u0627\u0626\u0644 \u0628\u0639\u062f.", start: "\u0627\u0628\u062f\u0623 \u0645\u062d\u0627\u062f\u062b\u0629", emptyConversation: "\u0627\u0643\u062a\u0628 \u0644\u0644\u0641\u0631\u064a\u0642 \u0644\u0628\u062f\u0621 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629.", back: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0631\u0633\u0627\u0626\u0644", placeholder: "\u0627\u0643\u062a\u0628 \u0631\u0633\u0627\u0644\u062a\u0643...", send: "\u0625\u0631\u0633\u0627\u0644", sending: "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...", sendFailed: "\u0644\u0645 \u062a\u064f\u0631\u0633\u0644 \u0631\u0633\u0627\u0644\u062a\u0643. \u0628\u0642\u064a \u0627\u0644\u0646\u0635 \u0645\u0648\u062c\u0648\u062f\u064b\u0627 \u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u062c\u062f\u062f\u0629.", loading: "\u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644...", loadFailed: "\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644.", retry: "\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627", newLabel: "\u062c\u062f\u064a\u062f", order: "\u0627\u0644\u0637\u0644\u0628", team: "\u0641\u0631\u064a\u0642 BlueMind Web Service", you: "\u0623\u0646\u062a",
  },
};

function formatTime(value: string | null, locale: Locale) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function TeamAvatar({ className = "" }: { className?: string }) {
  return <span className={`${styles.teamAvatar} ${className}`} aria-hidden="true"><Image src="/images/brand/bluemind-original-logo-transparent.png" alt="" width={32} height={36} /></span>;
}

export default function NotificationsMessages({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [selected, setSelected] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [sending, setSending] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const hasThread = messages.length > 0;
  const latest = useMemo(() => messages.at(-1) || null, [messages]);
  const unread = useMemo(() => messages.filter(message => message.sender === "team" && !message.read).length, [messages]);

  async function loadMessages(signal?: AbortSignal) {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/customer/messages", { credentials: "same-origin", cache: "no-store", signal: signal || AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error("messages");
      const data = await response.json();
      if (!Array.isArray(data.messages)) throw new Error("messages");
      setMessages(data.messages);
    } catch {
      if (!signal?.aborted) setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setSelected(false);
    setDraft("");
    setSendError(false);
    void loadMessages(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selected) return;
    requestAnimationFrame(() => {
      const node = messagesRef.current;
      if (node) node.scrollTop = node.scrollHeight;
    });
  }, [selected, messages.length]);

  async function openConversation() {
    setSelected(true);
    setSendError(false);
    if (unread) {
      const response = await fetch("/api/customer/messages-read", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => null);
      if (response?.ok) setMessages(current => current.map(message => message.sender === "team" ? { ...message, read: true } : message));
    }
  }

  function leaveConversation() {
    setSelected(false);
    setSendError(false);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError(false);
    try {
      const response = await fetch("/api/customer/message", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      if (!response.ok) throw new Error("send");
      const data = await response.json();
      if (!data.message?.id) throw new Error("send");
      setMessages(current => [...current, data.message]);
      setDraft("");
    } catch {
      setSendError(true);
      composerRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  return <section className={styles.messagesPage} aria-label={t.title}>
    <div className={styles.messageWorkspace} data-mode={selected ? "conversation" : "list"}>
      <section className={styles.messageList} data-message-list="true" data-hidden={selected ? "true" : "false"} aria-label={t.title}>
        <div className={styles.messageListHeading}><p className={styles.messageHint}>{t.listHint}</p><Mail size={22} aria-hidden="true" /></div>
        {loading && <p className={styles.messageState} role="status">{t.loading}</p>}
        {error && <div className={styles.messageState} role="alert"><p>{t.loadFailed}</p><button type="button" className={styles.secondary} onClick={() => void loadMessages()}>{t.retry}</button></div>}
        {!loading && !error && !hasThread && <div className={styles.messageState}><p>{t.emptyList}</p><button type="button" className={styles.primary} onClick={() => void openConversation()}>{t.start}</button></div>}
        {!loading && !error && hasThread && <div className={styles.threadList}>
          <button type="button" className={styles.thread} onClick={() => void openConversation()}>
            <TeamAvatar />
            <span className={styles.threadCopy}><span className={styles.threadTop}><strong>{t.teamName}</strong>{unread > 0 && <span className={styles.unreadLabel}>{unread} {t.newLabel}</span>}</span><span className={styles.threadPreview}>{latest?.body || ""}</span></span>
            <time>{formatTime(latest?.createdAt || null, locale)}</time>
          </button>
        </div>}
      </section>
      <section className={styles.conversation} data-message-conversation="true" data-visible={selected} aria-label={t.teamName}>
        {selected ? <>
          <header className={styles.conversationHeader}><button type="button" className={`${styles.backToMessages} ${styles.secondary}`} onClick={leaveConversation} aria-label={t.back}><ArrowLeft size={17} aria-hidden="true" />{t.back}</button><TeamAvatar className={styles.conversationTeamAvatar} /><div><h2>{t.teamName}</h2><span className={styles.teamSubtitle}>{t.team}</span></div></header>
          <div className={styles.conversationMessages} ref={messagesRef} aria-live="polite">
            {messages.length === 0 ? <div className={styles.conversationEmpty}><Mail size={30} strokeWidth={1.5} aria-hidden="true" /><p>{t.emptyConversation}</p></div> : messages.map(message => <article key={message.id} className={styles.demoMessage} data-sender={message.sender}><p>{message.body}</p>{message.orderNumber && <span className={styles.orderReference}>{t.order}: {message.orderNumber}</span>}<time><Clock3 size={13} aria-hidden="true" />{formatTime(message.createdAt, locale)}<span className={styles.messageSender}>{message.sender === "customer" ? t.you : t.team}</span></time></article>)}
          </div>
          {sendError && <p className={styles.messageNotice} role="alert">{t.sendFailed}</p>}
          <form className={styles.demoComposer} onSubmit={send}><label className={styles.srOnly} htmlFor="team-message">{t.placeholder}</label><textarea id="team-message" ref={composerRef} value={draft} onChange={event => setDraft(event.target.value)} placeholder={t.placeholder} rows={1} maxLength={4000} disabled={sending} /><button className={styles.roundAction} type="submit" aria-label={sending ? t.sending : t.send} title={sending ? t.sending : t.send} disabled={!draft.trim() || sending}><Send size={18} aria-hidden="true" /></button></form>
        </> : <div className={styles.conversationEmpty}><Mail size={30} strokeWidth={1.5} aria-hidden="true" /><p>{t.emptyList}</p></div>}
      </section>
    </div>
  </section>;
}
