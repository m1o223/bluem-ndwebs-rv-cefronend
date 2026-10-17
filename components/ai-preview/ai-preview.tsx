"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import { useLocalization } from "../localization-provider";
import { getDemoReply } from "./demo-reply";
import copy from "./copy.json";
import styles from "./ai-preview.module.css";

type Message = { id: number; role: "user" | "assistant"; text: string; label: string };

export default function AiPreview({ triggerClassName }: { triggerClassName: string }) {
  const { locale, translate } = useLocalization();
  const text = copy[locale];
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequence = useRef(0);
  const busy = useRef(false);
  const atLimit = messages.length >= 100;

  useEffect(() => {
    setMounted(true);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (!open || !dialog.current) return;
    const body = document.body;
    const { overflow, paddingRight } = body.style;
    const scrollbar = innerWidth - document.documentElement.clientWidth;
    if (scrollbar > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
    body.style.overflow = "hidden";
    dialog.current.showModal();
    input.current?.focus({ preventScroll: true });
    const current = dialog.current;
    return () => {
      current.close();
      body.style.overflow = overflow;
      body.style.paddingRight = paddingRight;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (history.current) history.current.scrollTop = history.current.scrollHeight;
  }, [messages, sending, open]);

  useEffect(() => {
    if (!input.current) return;
    input.current.style.height = "auto";
    input.current.style.height = `${Math.min(input.current.scrollHeight, 160)}px`;
  }, [draft, open]);

  function send(value = draft, suggestion?: number) {
    const message = value.trim().slice(0, 2000);
    if (!message || busy.current || atLimit) return;
    busy.current = true;
    setSending(true);
    setDraft("");
    const userMessage: Message = { id: ++sequence.current, role: "user", text: message, label: text.you };
    setMessages(previous => [...previous, userMessage]);
    const reply = getDemoReply(message, locale, suggestion);
    const label = text.simulated;
    timer.current = setTimeout(() => {
      const response: Message = { id: ++sequence.current, role: "assistant", text: reply, label };
      setMessages(previous => [...previous, response]);
      busy.current = false;
      setSending(false);
      timer.current = null;
    }, 650);
    input.current?.focus({ preventScroll: true });
  }

  return <>
    <button ref={trigger} type="button" className={`${triggerClassName} ${styles.trigger}`} aria-label={text.trigger} aria-haspopup="dialog" onClick={() => setOpen(true)} data-no-translate>
      <span className={styles.triggerSizer} aria-hidden="true">{translate("Explore Concepts")}</span>
      <span className={styles.triggerLabel} aria-hidden="true">{text.trigger}<Sparkles size={15} /></span>
    </button>
    {mounted && createPortal(
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="ai-preview-title" aria-describedby="ai-preview-notice" data-no-translate onCancel={event => { event.preventDefault(); setOpen(false); }} onKeyDown={event => {
        if (event.key !== "Tab") return;
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), textarea")];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
        <div className={styles.room}>
          <header className={styles.header}>
            <div className={styles.identity}><Sparkles size={20} aria-hidden="true" /><h2 id="ai-preview-title">BlueMind AI</h2><span className={styles.badge} dir="auto">{text.preview}</span></div>
            <button type="button" className={styles.iconControl} aria-label={text.close} title={text.close} onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button>
          </header>
          <p id="ai-preview-notice" className={styles.notice} dir="auto">{text.notice}</p>
          <div className={styles.history} ref={history} role="log" aria-label="BlueMind AI" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 && <div className={styles.welcome} dir="auto">
              <Sparkles size={30} aria-hidden="true" />
              <h3>{text.welcome}</h3>
              <p>{text.intro}</p>
            </div>}
            {messages.map(message => <div key={message.id} className={message.role === "user" ? styles.user : styles.assistant}>
              <span className={styles.speaker} dir="auto">{message.label}</span>
              <p dir="auto">{message.text}</p>
            </div>)}
            {sending && <p role="status" className={styles.loading} dir="auto">{text.loading}</p>}
          </div>
          <div className={styles.bottom}>
            <div className={styles.suggestions}>
              {text.suggestions.map((suggestion, index) => <button type="button" className={styles.suggestion} key={index} disabled={sending || atLimit} dir="auto" onClick={() => send(suggestion, index)}>{suggestion}</button>)}
            </div>
            <form className={styles.composer} onSubmit={event => { event.preventDefault(); send(); }}>
              <textarea ref={input} value={draft} rows={1} maxLength={2000} dir="auto" aria-label={text.input} placeholder={text.placeholder} onChange={event => setDraft(event.target.value)} onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && matchMedia("(pointer: fine)").matches) {
                  event.preventDefault();
                  send();
                }
              }} />
              <button type="submit" className={styles.sendButton} disabled={!draft.trim() || sending || atLimit} aria-label={text.send} title={text.send}><ArrowUpRight size={22} aria-hidden="true" /></button>
            </form>
            {atLimit && <p role="status" className={styles.limit} dir="auto">{text.limit}</p>}
          </div>
        </div>
      </dialog>, document.body)}
  </>;
}
