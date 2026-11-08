"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ImageIcon, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BlueMindLogo } from "../blue-mind-logo";
import { useLocalization } from "../localization-provider";
import { AI_ERRORS, type ChatTurn } from "../../app/lib/ai/contract";
import { ChatRequestError, requestReply } from "../../app/lib/ai/client";
import { attachmentUrl, imageAccept, readAttachment, wireAttachment, type LocalAttachment } from "../../app/lib/ai/attachments";
import styles from "./bluemind-ai-demo.module.css";

type Locale = "en" | "ar" | "sv";
type DemoMessage = { id: string; role: "user" | "assistant"; text: string; attachments?: LocalAttachment[] };

const copy: Record<Locale, {
  title: string; helpTitle: string; helpBody: string; ask: string; greeting: string;
  placeholder: string; continueTitle: string; continueButton: string; uploading: string; error: string;
}> = {
  en: {
    title: "BlueMind AI",
    helpTitle: "How can BlueMind AI help you?",
    helpBody: "Tell it about your website idea in your own words. It helps you prepare your request and walks you through the plans and payment options so you can choose what works for you. Once your request is sent to the team, it tracks your website's progress and keeps you updated until delivery.",
    ask: "Ask BlueMind AI",
    greeting: "Hi! What kind of website do you have in mind? Tell me about your idea and I'll help you shape it. You can also upload an image to show me the style you like.",
    placeholder: "Tell BlueMind AI about your idea...",
    continueTitle: "Keep working on your idea",
    continueButton: "Continue in BlueMind AI",
    uploading: "Preparing image...",
    error: "We could not complete that preview message. Please try again.",
  },
  ar: {
    title: "BlueMind AI",
    helpTitle: "كيف بيساعدك BlueMind AI؟",
    helpBody: "احكيله فكرة موقعك بكلماتك. بيساعدك ترتّبها وتجهّز طلبك، وبيشرحلك الخطط وطرق الدفع حتى تختار اللي بناسبك. وبعد ما يرسل طلبك للفريق، بيتابع تقدّم موقعك خطوة بخطوة وبيبعتلك تحديثات لحد ما تستلمه.",
    ask: "جرّب BlueMind AI",
    greeting: "أهلًا! شو فكرة الموقع اللي ببالك؟ احكيلي عنها، وبساعدك ترتّبها. فيك كمان ترفع صورة لتورجيني الشكل اللي بتحبّه.",
    placeholder: "احكي لـ BlueMind AI عن فكرتك...",
    continueTitle: "كمّل فكرتك مع BlueMind AI",
    continueButton: "جرّبها في BlueMind AI",
    uploading: "عم نجهّز الصورة...",
    error: "ما قدرنا نكمّل رسالة التجربة. جرّب مرة ثانية.",
  },
  sv: {
    title: "BlueMind AI",
    helpTitle: "Hur kan BlueMind AI hjälpa dig?",
    helpBody: "Berätta om din webbplatsidé med dina egna ord. BlueMind AI hjälper dig att förbereda din förfrågan och guidar dig genom planer och betalningsalternativ. När förfrågan skickas till teamet följer den projektets framsteg och håller dig uppdaterad tills leverans.",
    ask: "Fråga BlueMind AI",
    greeting: "Hej! Vilken typ av webbplats har du i åtanke? Berätta om din idé så hjälper jag dig att forma den. Du kan också ladda upp en bild.",
    placeholder: "Berätta om din idé...",
    continueTitle: "Fortsätt arbeta med din idé",
    continueButton: "Fortsätt i BlueMind AI",
    uploading: "Förbereder bilden...",
    error: "Förhandsmeddelandet kunde inte slutföras. Försök igen.",
  },
};

const welcomeId = "bluemind-ai-demo-welcome";

export default function BlueMindAiDemo() {
  const { locale: selectedLocale } = useLocalization();
  const locale = (selectedLocale === "ar" || selectedLocale === "sv" ? selectedLocale : "en") as Locale;
  const text = copy[locale];
  const [messages, setMessages] = useState<DemoMessage[]>([{ id: welcomeId, role: "assistant", text: text.greeting }]);
  const [turns, setTurns] = useState<DemoMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<LocalAttachment[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [pending, setPending] = useState(false);
  const [successfulMessages, setSuccessfulMessages] = useState(0);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const imagePicker = useRef<HTMLInputElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMessages(current => current.length === 1 && current[0].id === welcomeId ? [{ ...current[0], text: text.greeting }] : current);
  }, [text.greeting]);

  useEffect(() => {
    const element = scroll.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => () => {
    request.current?.abort();
    if (lockTimer.current) clearTimeout(lockTimer.current);
  }, []);

  async function chooseImage(file: File | undefined) {
    if (!file || pending || locked || preparing) return;
    const controller = new AbortController();
    setPreparing(true);
    setError("");
    try {
      const image = await readAttachment(file, controller.signal, () => undefined);
      setFiles(current => [...current, image]);
    } catch { setError(text.error); }
    finally { setPreparing(false); }
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if ((!value && !files.length) || pending || locked || successfulMessages >= 2 || preparing) return;
    const user: DemoMessage = { id: crypto.randomUUID(), role: "user", text: value, ...(files.length ? { attachments: files } : {}) };
    const assistantId = crypto.randomUUID();
    const currentTurns = turns;
    const assistant: DemoMessage = { id: assistantId, role: "assistant", text: "" };
    const apiTurns: ChatTurn[] = [...currentTurns, user].map(message => ({
      role: message.role,
      content: message.text,
      ...(message.attachments?.length ? { attachments: message.attachments.map(wireAttachment) } : {}),
    }));
    const controller = new AbortController();
    request.current = controller;
    setMessages(current => [...current, user, assistant]);
    setDraft("");
    setFiles([]);
    setPending(true);
    setError("");
    let responseText = "";
    try {
      await requestReply(apiTurns, controller.signal, delta => {
        responseText += delta;
        setMessages(current => current.map(message => message.id === assistantId ? { ...message, text: message.text + delta } : message));
      }, undefined, { endpoint: "/api/ai/demo", credentials: "same-origin" });
      const completedAssistant = { ...assistant, text: responseText };
      setTurns([...currentTurns, user, completedAssistant]);
      const nextCount = successfulMessages + 1;
      setSuccessfulMessages(nextCount);
      if (nextCount === 2) lockTimer.current = setTimeout(() => setLocked(true), 700);
    } catch (caught) {
      if (!controller.signal.aborted) {
        setError(caught instanceof ChatRequestError ? caught.message : text.error);
        setMessages(current => current.filter(message => message.id !== assistantId));
      }
    } finally {
      if (request.current === controller) request.current = null;
      setPending(false);
    }
  }

  function continueInFullChat() {
    try {
      sessionStorage.setItem("bluemind-ai-demo-transfer", JSON.stringify({ source: "what-we-build", messages: turns }));
      window.location.assign("/ask-ai?source=what-we-build&continue=1");
    } catch { setError(text.error); }
  }

  return <section className={styles.section} data-bluemind-ai data-no-translate dir={locale === "ar" ? "rtl" : "ltr"} aria-labelledby="bluemind-ai-title">
    <div className={styles.inner}>
      <div className={styles.demo} data-ai-demo>
        <div className={styles.tabletFrame}>
          <div className={styles.tabletScreen}>
            <header className={styles.demoHeader}>
              <BlueMindLogo className={styles.demoLogo} solid />
              <strong>BlueMind AI</strong>
              <button type="button" className={styles.demoMenu} aria-label="Open menu" disabled><Menu size={17} /></button>
            </header>
            <div ref={scroll} className={styles.demoMessages} aria-live="polite" aria-label="BlueMind AI preview conversation">
              {messages.map(message => <article key={message.id} className={`${styles.demoMessage} ${message.role === "user" ? styles.demoUser : styles.demoAssistant}`}>
                {message.attachments?.map(file => <Image key={file.id} src={attachmentUrl(file)} alt={file.name} width={72} height={54} className={styles.demoAttachment} unoptimized />)}
                {message.text && <p>{message.text}</p>}
              </article>)}
              {pending && <span className={styles.demoThinking} aria-label="BlueMind AI is thinking" />}
            </div>
            <form className={styles.demoComposer} onSubmit={send}>
              <input ref={imagePicker} type="file" accept={imageAccept} hidden onChange={event => { void chooseImage(event.target.files?.[0]); event.target.value = ""; }} />
              {files.length > 0 && <div className={styles.demoFiles}>{files.map(file => <button type="button" key={file.id} onClick={() => setFiles(current => current.filter(item => item.id !== file.id))} aria-label={`Remove ${file.name}`}><Image src={attachmentUrl(file)} alt="" width={28} height={28} unoptimized /><X size={11} /></button>)}</div>}
              <button type="button" className={styles.demoIcon} aria-label="Upload image" title="Upload image" disabled={pending || locked || preparing} onClick={() => imagePicker.current?.click()}><ImageIcon size={16} /></button>
              <textarea value={draft} rows={1} maxLength={1200} placeholder={text.placeholder} aria-label={text.placeholder} disabled={pending || locked} onChange={event => setDraft(event.target.value)} />
              <button type="submit" className={styles.demoSend} aria-label="Send message" disabled={pending || locked || preparing || (!draft.trim() && !files.length)}><ArrowUp size={16} /></button>
            </form>
            {preparing && <span className={styles.demoStatus}>{text.uploading}</span>}
            {error && <span className={styles.demoError} role="alert">{error}</span>}
            {locked && <div className={styles.demoOverlay} role="dialog" aria-modal="true" aria-labelledby="demo-continue-title">
              <div className={styles.overlayContent}>
                <h3 id="demo-continue-title">{text.continueTitle}</h3>
                <button type="button" onClick={continueInFullChat}>{text.continueButton}<ArrowUp size={15} /></button>
              </div>
            </div>}
          </div>
        </div>
      </div>
      <div className={styles.copy}>
        <h2 id="bluemind-ai-title" className={styles.title}>{text.title}</h2>
        <h3>{text.helpTitle}</h3>
        <p>{text.helpBody}</p>
        <Link href="/ask-ai?source=what-we-build&new=1" className={styles.mobileCta}>{text.ask}<ArrowUp size={16} /></Link>
      </div>
    </div>
  </section>;
}
