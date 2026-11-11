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
  welcome: string;
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
    title: "Messages", teamName: "BlueMind Web Service", listHint: "Your conversation with the BlueMind Web Service team", welcome: "Welcome to BlueMind Web Service. How can I help you today?", back: "Back", placeholder: "Write your message...", send: "Send", sending: "Sending...", sendFailed: "Your message was not sent. Your text is still here so you can try again.", loading: "Loading messages...", loadFailed: "Messages could not be loaded.", retry: "Try again", newLabel: "New", order: "Order", team: "BlueMind Web Service", you: "You",
  },
  sv: {
    title: "Meddelanden", teamName: "BlueMind Web Service", listHint: "Din konversation med BlueMind Web Service-teamet", welcome: "Välkommen till BlueMind Web Service. Hur kan jag hjälpa dig idag?", back: "Tillbaka", placeholder: "Skriv ditt meddelande...", send: "Skicka", sending: "Skickar...", sendFailed: "Ditt meddelande skickades inte. Texten finns kvar så att du kan försöka igen.", loading: "Läser meddelanden...", loadFailed: "Meddelandena kunde inte läsas.", retry: "Försök igen", newLabel: "Ny", order: "Order", team: "BlueMind Web Service", you: "Du",
  },
  ar: {
    title: "\u0627\u0644\u0631\u0633\u0627\u0626\u0644", teamName: "BlueMind Web Service", listHint: "\u0645\u062d\u0627\u062f\u062b\u062a\u0643 \u0645\u0639 \u0641\u0631\u064a\u0642 BlueMind Web Service", welcome: "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643 \u0641\u064a BlueMind Web Service. \u0643\u064a\u0641 \u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0627\u0644\u064a\u0648\u0645?", back: "\u0631\u062c\u0648\u0639", placeholder: "\u0627\u0643\u062a\u0628 \u0631\u0633\u0627\u0644\u062a\u0643...", send: "\u0625\u0631\u0633\u0627\u0644", sending: "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...", sendFailed: "\u0644\u0645 \u062a\u064f\u0631\u0633\u0644 \u0631\u0633\u0627\u0644\u062a\u0643. \u0628\u0642\u064a \u0627\u0644\u0646\u0635 \u0645\u0648\u062c\u0648\u062f\u064b\u0627 \u0644\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u062c\u062f\u062f\u0629.", loading: "\u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644...", loadFailed: "\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644.", retry: "\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627", newLabel: "\u062c\u062f\u064a\u062f", order: "\u0627\u0644\u0637\u0644\u0628", team: "BlueMind Web Service", you: "\u0623\u0646\u062a",
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
  const latest = useMemo(() => messages.at(-1) || null, [messages]);
  const unread = useMemo(() => messages.filter(message => message.sender === "team" && !message.read).length, [messages]);

  useEffect(() => {
    const syncFromUrl = () => setSelected(new URL(window.location.href).searchParams.get("conversation") === "team");
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    document.body.dataset.customerMessagesOpen = selected ? "true" : "false";
    return () => { delete document.body.dataset.customerMessagesOpen; };
  }, [selected]);

  useEffect(() => {
    if (!selected || unread === 0) return;
    void fetch("/api/customer/messages-read", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" }).then(response => {
      if (response.ok) setMessages(current => current.map(message => message.sender === "team" ? { ...message, read: true } : message));
    }).catch(() => {});
  }, [selected, unread]);

  async function loadMessages(signal?: AbortSignal) {
    setLoading(true);
    setError(false);
    try {
      const requestSignal = signal || AbortSignal.timeout(20000);
      const welcome = await fetch("/api/customer/messages-welcome", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale }), signal: requestSignal });
      if (!welcome.ok) throw new Error("welcome");
      const response = await fetch("/api/customer/messages", { credentials: "same-origin", cache: "no-store", signal: requestSignal });
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

  function openConversation() {
    if (!selected) {
      const url = new URL(window.location.href);
      url.searchParams.set("conversation", "team");
      window.history.pushState({ messages: "conversation" }, "", url);
    }
    setSelected(true);
    setSendError(false);
  }

  function leaveConversation() {
    setSendError(false);
    const url = new URL(window.location.href);
    if (url.searchParams.get("conversation") === "team") window.history.back();
    else setSelected(false);
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
        {!loading && !error && <div className={styles.threadList}>
          <button type="button" className={styles.thread} onClick={openConversation}>
            <TeamAvatar />
            <span className={styles.threadCopy}><span className={styles.threadTop}><strong>{t.teamName}</strong>{unread > 0 && <span className={styles.unreadLabel}>{unread} {t.newLabel}</span>}</span><span className={styles.threadPreview}>{latest?.body || t.welcome}</span></span>
            <time>{formatTime(latest?.createdAt || null, locale)}</time>
          </button>
        </div>}
      </section>
      <section className={styles.conversation} data-message-conversation="true" data-visible={selected} aria-label={t.teamName}>
        {selected && <>
          <header className={styles.conversationHeader} data-message-conversation-header="true"><button type="button" className={`${styles.backToMessages} ${styles.secondary}`} onClick={leaveConversation} aria-label={t.back}><ArrowLeft size={17} aria-hidden="true" />{t.back}</button><TeamAvatar className={styles.conversationTeamAvatar} /><h2>{t.teamName}</h2></header>
          <div className={styles.conversationMessages} ref={messagesRef} aria-live="polite">
            {(messages.length ? messages : [{ id: "welcome-preview", sender: "team" as const, body: t.welcome, createdAt: null, read: true }]).map(message => <article key={message.id} className={styles.demoMessage} data-sender={message.sender}><p>{message.body}</p>{message.orderNumber && <span className={styles.orderReference}>{t.order}: {message.orderNumber}</span>}<time><Clock3 size={13} aria-hidden="true" />{formatTime(message.createdAt, locale)}<span className={styles.messageSender}>{message.sender === "customer" ? t.you : t.team}</span></time></article>)}
          </div>
          {sendError && <p className={styles.messageNotice} role="alert">{t.sendFailed}</p>}
          <form className={styles.demoComposer} onSubmit={send}><label className={styles.srOnly} htmlFor="team-message">{t.placeholder}</label><textarea id="team-message" ref={composerRef} value={draft} onChange={event => setDraft(event.target.value)} placeholder={t.placeholder} rows={1} maxLength={4000} disabled={sending} /><button className={styles.roundAction} type="submit" aria-label={sending ? t.sending : t.send} title={sending ? t.sending : t.send} disabled={!draft.trim() || sending}><Send size={18} aria-hidden="true" /></button></form>
        </>}
      </section>
    </div>
  </section>;
}
