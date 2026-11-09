"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Camera, ImageIcon, Menu, MessageSquare, PanelLeftClose, PanelLeftOpen, Plus, Square, SquarePen, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BlueMindLogo } from "../blue-mind-logo";
import { useLocalization } from "../localization-provider";
import type { ChatTurn } from "../../app/lib/ai/contract";
import { ChatRequestError, requestReply } from "../../app/lib/ai/client";
import { attachmentUrl, imageAccept, readAttachment, wireAttachment, type LocalAttachment } from "../../app/lib/ai/attachments";
import styles from "./bluemind-ai-demo.module.css";

type Locale = "en" | "ar" | "sv";
type DemoMessage = { id: string; role: "user" | "assistant"; text: string; attachments?: LocalAttachment[] };
type DemoConversation = { id: string; title: string; messages: DemoMessage[]; turns: DemoMessage[] };

const suggestions = ["Create a website", "Design a page", "Improve my website", "Business ideas", "Help me get started", "Explore our services"];
const copy: Record<Locale, {
  title: string; helpTitle: string; helpBody: string; ask: string; greeting: string; emptyTitle: string;
  placeholder: string; continueTitle: string; continueButton: string; uploading: string; error: string;
  newChat: string; conversations: string; openMenu: string; closeMenu: string; uploadImage: string; takePhoto: string;
  removeImage: string; send: string; stop: string; imagePreview: string;
}> = {
  en: {
    title: "BlueMind AI", helpTitle: "How can BlueMind AI help you?", helpBody: "Tell it about your website idea in your own words. It helps you prepare your request and walks you through the plans and payment options so you can choose what works for you. Once your request is sent to the team, it tracks your website's progress and keeps you updated until delivery.", ask: "Ask BlueMind AI", greeting: "Hi! What kind of website do you have in mind? Tell me about your idea and I'll help you shape it. You can also upload an image to show me the style you like.", emptyTitle: "What can I help you create?", placeholder: "Tell BlueMind AI about your idea...", continueTitle: "Keep working on your idea", continueButton: "Continue in BlueMind AI", uploading: "Preparing image...", error: "We could not complete that preview message. Please try again.", newChat: "New chat", conversations: "Conversations", openMenu: "Open menu", closeMenu: "Close menu", uploadImage: "Upload image", takePhoto: "Take a photo", removeImage: "Remove image", send: "Send message", stop: "Stop response", imagePreview: "Attached image",
  },
  ar: {
    title: "BlueMind AI", helpTitle: "كيف بيساعدك BlueMind AI؟", helpBody: "احكيله فكرة موقعك بكلماتك. بيساعدك ترتّبها وتجهّز طلبك، وبيشرحلك الخطط وطرق الدفع حتى تختار اللي بناسبك. وبعد ما يرسل طلبك للفريق، بيتابع تقدّم موقعك خطوة بخطوة وبيبعتلك تحديثات لحد ما تستلمه.", ask: "جرّب BlueMind AI", greeting: "أهلًا! شو فكرة الموقع اللي ببالك؟ احكيلي عنها، وبساعدك ترتّبها. فيك كمان ترفع صورة لتورجيني الشكل اللي بتحبّه.", emptyTitle: "شو فيني ساعدك تخلق؟", placeholder: "احكي لـ BlueMind AI عن فكرتك...", continueTitle: "كمّل فكرتك مع BlueMind AI", continueButton: "كمّل مع BlueMind AI", uploading: "عم نجهّز الصورة...", error: "ما قدرنا نكمّل رسالة التجربة. جرّب مرة ثانية.", newChat: "محادثة جديدة", conversations: "المحادثات", openMenu: "افتح القائمة", closeMenu: "سكّر القائمة", uploadImage: "ارفع صورة", takePhoto: "التقط صورة", removeImage: "احذف الصورة", send: "إرسال الرسالة", stop: "إيقاف الرد", imagePreview: "الصورة المرفقة",
  },
  sv: {
    title: "BlueMind AI", helpTitle: "Hur kan BlueMind AI hjälpa dig?", helpBody: "Berätta om din webbplatsidé med dina egna ord. BlueMind AI hjälper dig att förbereda din förfrågan och guidar dig genom planer och betalningsalternativ. När förfrågan skickas till teamet följer den projektets framsteg och håller dig uppdaterad tills leverans.", ask: "Fråga BlueMind AI", greeting: "Hej! Vilken typ av webbplats har du i åtanke? Berätta om din idé så hjälper jag dig att forma den. Du kan också ladda upp en bild.", emptyTitle: "Vad kan jag hjälpa dig att skapa?", placeholder: "Berätta om din idé...", continueTitle: "Fortsätt arbeta med din idé", continueButton: "Fortsätt i BlueMind AI", uploading: "Förbereder bilden...", error: "Förhandsmeddelandet kunde inte slutföras. Försök igen.", newChat: "Ny chatt", conversations: "Konversationer", openMenu: "Öppna menyn", closeMenu: "Stäng menyn", uploadImage: "Ladda upp bild", takePhoto: "Ta ett foto", removeImage: "Ta bort bild", send: "Skicka meddelande", stop: "Stoppa svar", imagePreview: "Bifogad bild",
  },
};

const createId = () => crypto.randomUUID();

export default function BlueMindAiDemo() {
  const { locale: selectedLocale } = useLocalization();
  const locale = (selectedLocale === "ar" || selectedLocale === "sv" ? selectedLocale : "en") as Locale;
  const text = copy[locale];
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [turns, setTurns] = useState<DemoMessage[]>([]);
  const [conversations, setConversations] = useState<DemoConversation[]>([]);
  const [conversationId, setConversationId] = useState(createId);
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<LocalAttachment[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [pending, setPending] = useState(false);
  const [successfulMessages, setSuccessfulMessages] = useState(0);
  const [locked, setLocked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const imagePicker = useRef<HTMLInputElement>(null);
  const cameraPicker = useRef<HTMLInputElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasUserMessage = messages.some(message => message.role === "user");
  const sessionLocked = locked || successfulMessages >= 2;

  useEffect(() => {
    const element = scroll.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (!input.current) return;
    input.current.style.height = "auto";
    input.current.style.height = `${Math.min(input.current.scrollHeight, 72)}px`;
  }, [draft]);

  useEffect(() => () => {
    request.current?.abort();
    if (lockTimer.current) clearTimeout(lockTimer.current);
  }, []);

  function focusInput() {
    window.setTimeout(() => input.current?.focus(), 0);
  }

  function restoreConversation(conversation: DemoConversation) {
    if (pending) return;
    setConversationId(conversation.id);
    setMessages(conversation.messages);
    setTurns(conversation.turns);
    setDraft("");
    setFiles([]);
    setError("");
    focusInput();
  }

  function rememberConversation(nextMessages: DemoMessage[], nextTurns: DemoMessage[], id = conversationId, title?: string) {
    const firstUser = nextTurns.find(message => message.role === "user");
    const entry: DemoConversation = { id, title: title || firstUser?.text.slice(0, 36) || "Website idea", messages: nextMessages, turns: nextTurns };
    setConversations(current => [entry, ...current.filter(item => item.id !== id)]);
  }

  function startNewChat() {
    if (pending) return;
    const id = createId();
    setConversationId(id);
    setMessages([]);
    setTurns([]);
    setDraft("");
    setFiles([]);
    setError("");
    setLocked(successfulMessages >= 2);
    setAttachmentMenuOpen(false);
    focusInput();
  }

  async function chooseImages(selected: FileList | File | undefined) {
    const selectedFiles = selected instanceof File ? [selected] : selected ? Array.from(selected) : [];
    if (!selectedFiles.length || pending || sessionLocked || preparing) return;
    setPreparing(true);
    setError("");
    try {
      const remaining = Math.max(0, 4 - files.length);
      const prepared = [] as LocalAttachment[];
      for (const file of selectedFiles.slice(0, remaining)) prepared.push(await readAttachment(file, new AbortController().signal, () => undefined));
      setFiles(current => [...current, ...prepared]);
      setAttachmentMenuOpen(false);
      focusInput();
    } catch { setError(text.error); }
    finally { setPreparing(false); }
  }

  function removeFile(id: string) {
    setFiles(current => current.filter(file => file.id !== id));
  }

  function stopReply() {
    request.current?.abort();
    request.current = null;
    setPending(false);
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const value = draft.trim();
    if ((!value && !files.length) || pending || sessionLocked || preparing) return;
    const user: DemoMessage = { id: createId(), role: "user", text: value, ...(files.length ? { attachments: files } : {}) };
    const assistantId = createId();
    const assistant: DemoMessage = { id: assistantId, role: "assistant", text: "" };
    const currentTurns = turns;
    const nextMessages = [...messages, user, assistant];
    const apiTurns: ChatTurn[] = [...currentTurns, user].map(message => ({ role: message.role, content: message.text, ...(message.attachments?.length ? { attachments: message.attachments.map(wireAttachment) } : {}) }));
    const controller = new AbortController();
    request.current = controller;
    setMessages(nextMessages);
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
      const completedTurns = [...currentTurns, user, completedAssistant];
      const completedMessages = [...messages, user, completedAssistant];
      setTurns(completedTurns);
      setMessages(completedMessages);
      rememberConversation(completedMessages, completedTurns, conversationId, user.text || user.attachments?.[0]?.name);
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
          <div className={styles.tabletScreen} dir="ltr">
            <aside className={`${styles.demoSidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`} aria-label="BlueMind AI menu">
              <div className={styles.sidebarHeader}>
                <div className={styles.sidebarBrand}><BlueMindLogo className={styles.demoLogo} solid /><strong>BlueMind AI</strong></div>
                <button type="button" className={styles.sidebarToggle} onClick={() => setSidebarOpen(value => !value)} aria-label={sidebarOpen ? text.closeMenu : text.openMenu} title={sidebarOpen ? text.closeMenu : text.openMenu}>
                  {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                </button>
              </div>
              <button type="button" className={styles.newChat} onClick={startNewChat} disabled={pending} title={text.newChat}>
                <SquarePen size={15} /><span>{text.newChat}</span>
              </button>
              {sidebarOpen && <>
                <p className={styles.historyLabel}>{text.conversations}</p>
                <nav className={styles.history} aria-label={text.conversations}>
                  {conversations.length ? conversations.map(conversation => <button type="button" key={conversation.id} className={styles.historyItem} aria-current={conversation.id === conversationId ? "page" : undefined} onClick={() => restoreConversation(conversation)}><MessageSquare size={14} /><span>{conversation.title}</span></button>) : <span className={styles.emptyHistory}>No conversations yet</span>}
                </nav>
              </>}
            </aside>
            <main className={styles.demoMain} dir={locale === "ar" ? "rtl" : "ltr"}>
              <header className={styles.demoTopbar}><span>{text.title}</span><Menu size={15} aria-hidden="true" /></header>
              <div ref={scroll} className={styles.demoMessages} aria-live="polite" aria-label="BlueMind AI preview conversation">
                {!hasUserMessage ? <div className={styles.demoEmpty}>
                  <BlueMindLogo className={styles.emptyLogo} solid />
                  <h3>{text.title}</h3>
                  <p className={styles.emptyTitle}>{text.emptyTitle}</p>
                  <p className={styles.greeting}>{text.greeting}</p>
                  <div className={styles.suggestions}>{suggestions.map(suggestion => <button key={suggestion} type="button" onClick={() => { setDraft(suggestion); focusInput(); }}>{suggestion}</button>)}</div>
                </div> : messages.map(message => <article key={message.id} className={`${styles.demoMessage} ${message.role === "user" ? styles.demoUser : styles.demoAssistant}`}>
                  {message.attachments?.map(file => <figure key={file.id} className={styles.demoAttachment} style={{ aspectRatio: file.width && file.height ? `${file.width}/${file.height}` : "4/3" }}><Image src={attachmentUrl(file)} alt={file.name} fill sizes="(max-width: 1023px) 120px, 180px" unoptimized /></figure>)}
                  {message.text && <p>{message.text}</p>}
                </article>)}
                {pending && <span className={styles.demoThinking} aria-label="BlueMind AI is thinking" />}
              </div>
              <form className={styles.demoComposer} onSubmit={send}>
                <input ref={imagePicker} type="file" accept={imageAccept} multiple hidden onChange={event => { void chooseImages(event.target.files ?? undefined); event.target.value = ""; }} />
                <input ref={cameraPicker} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={event => { void chooseImages(event.target.files ?? undefined); event.target.value = ""; }} />
                {files.length > 0 && <div className={styles.demoFiles}>{files.map(file => <div className={styles.demoFile} key={file.id} style={{ aspectRatio: file.width && file.height ? `${file.width}/${file.height}` : "4/3" }}><Image src={attachmentUrl(file)} alt={text.imagePreview} fill sizes="80px" unoptimized /><button type="button" onClick={() => removeFile(file.id)} aria-label={`${text.removeImage}: ${file.name}`}><X size={11} /></button></div>)}</div>}
                <div className={styles.attachmentArea}>
                  <button type="button" className={styles.demoIcon} aria-label="Add attachment" title="Add attachment" aria-expanded={attachmentMenuOpen} onClick={() => setAttachmentMenuOpen(value => !value)} disabled={pending || sessionLocked || preparing}><Plus size={16} /></button>
                  {attachmentMenuOpen && <div className={styles.demoAttachmentMenu} role="menu">
                    <button type="button" role="menuitem" onClick={() => imagePicker.current?.click()}><ImageIcon size={14} />{text.uploadImage}</button>
                    <button type="button" role="menuitem" onClick={() => cameraPicker.current?.click()}><Camera size={14} />{text.takePhoto}</button>
                  </div>}
                </div>
                <textarea ref={input} value={draft} rows={1} maxLength={1200} placeholder={text.placeholder} aria-label={text.placeholder} disabled={pending || sessionLocked} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />
                {pending ? <button type="button" className={styles.demoSend} onClick={stopReply} aria-label={text.stop} title={text.stop}><Square size={13} fill="currentColor" /></button> : <button type="submit" className={styles.demoSend} aria-label={text.send} title={text.send} disabled={sessionLocked || preparing || (!draft.trim() && !files.length)}><ArrowUp size={16} /></button>}
              </form>
              {preparing && <span className={styles.demoStatus}>{text.uploading}</span>}
              {error && <span className={styles.demoError} role="alert">{error}</span>}
              {sessionLocked && <div className={styles.demoOverlay} role="dialog" aria-modal="true" aria-labelledby="demo-continue-title"><div className={styles.overlayContent}><h3 id="demo-continue-title">{text.continueTitle}</h3><button type="button" onClick={continueInFullChat}>{text.continueButton}<ArrowUp size={15} /></button></div></div>}
            </main>
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
