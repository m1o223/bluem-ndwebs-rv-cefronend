"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { packages } from "../../app/quote/quote-data";
import { useLocalization } from "../localization-provider";
import styles from "./blue-mind-ai-overlay.module.css";

type AttachmentItem = { id: string; name: string; kind: "image" | "file"; size: string };
type Message = { id: number; role: "user" | "ai"; text: string; attachments?: AttachmentItem[] };
type Draft = { websiteType?: string; projectName?: string; description?: string; pages?: string; features?: string; style?: string; domain?: string; logo?: string; details?: string };
type DraftKey = keyof Draft;
type Step = DraftKey | "complete" | null;
type Action = "build" | "package" | "order" | "unsure" | "features" | "process";

const fixedPackages = packages.filter((item) => item.cta === "Get Started");
const maxAttachmentSize = 8 * 1024 * 1024;

const steps: { key: DraftKey; question: string; suggestions?: string[] }[] = [
  { key: "websiteType", question: "What type of website would you like to create?", suggestions: ["Business Website", "Online Store", "Restaurant Website", "Portfolio", "I'm Not Sure"] },
  { key: "projectName", question: "What is the business or project name?" },
  { key: "description", question: "What does your business do?" },
  { key: "pages", question: "Which pages do you need?", suggestions: ["Home, About, Services, Contact", "Home, Menu, About, Contact", "Products, Cart, Checkout, Contact", "I'm Not Sure"] },
  { key: "features", question: "Which features should the website include?", suggestions: ["Contact Form", "Booking", "Online Store", "Gallery", "Payments", "Maps"] },
  { key: "style", question: "What colors or design style do you prefer?" },
  { key: "domain", question: "Do you already have a domain?", suggestions: ["Yes", "No", "Not Yet"] },
  { key: "logo", question: "Do you already have a logo?", suggestions: ["Yes", "No", "Need Help"] },
  { key: "details", question: "Add any extra project details you want BlueMind to know." },
];

const baseLabels = {
  ask: "Ask BlueMind AI",
  close: "Close BlueMind AI",
  maximize: "Maximize BlueMind AI",
  restore: "Restore BlueMind AI",
  newConversation: "New conversation",
  brand: "BlueMind AI",
  welcome: "How can I help you today?",
  demo: "Frontend demo only - no backend, payment, or real AI request is made today.",
  placeholder: "Tell BlueMind AI about your website idea...",
  send: "Send",
  attach: "Attach file or image",
  build: "Build My Website",
  package: "Help Me Choose a Package",
  order: "Create My Order",
  unsure: "I Don't Know What I Need",
  featuresAction: "Explore Website Features",
  processAction: "How Does BlueMind Work?",
  welcomeReply: "Welcome to the BlueMind AI demo. I can help shape your website idea, recommend a package, and prepare an order summary for tomorrow's real backend integration.",
  buildReply: "Great. Let's start with your idea. What kind of website would you like to create?",
  packageReply: "I can compare the current BlueMind packages using the published pricing. Tell me what you need and I will suggest a fit.",
  orderReply: "Let's create a frontend-only order summary. I will ask one question at a time.",
  unsureReply: "No problem. Tell me what your business does, and I will guide the next step.",
  featuresReply: "BlueMind can help you compare features such as contact forms, booking, galleries, online stores, payments, maps, newsletters, and customer accounts. Tell me what your website should do.",
  processReply: "BlueMind works step by step: we understand your idea, recommend the right package, collect project details, verify your email, prepare checkout, and hand the order to our team for review.",
  genericReply: "Thanks. For this frontend demo, I can guide you through a sample project order or summarize package options without creating a real order.",
  summaryReady: "I prepared a frontend-only order summary from your answers. Review it below before tomorrow's real backend connection.",
  sending: "BlueMind AI is preparing a demo reply...",
  summaryTitle: "Your Website Project",
  project: "Project",
  websiteType: "Website Type",
  pages: "Pages",
  features: "Features",
  style: "Style",
  domain: "Domain",
  logo: "Logo",
  packageLabel: "Recommended Package",
  edit: "Edit Details",
  checkout: "Continue to Checkout",
  checkoutTitle: "Demo checkout preview",
  checkoutText: "Tomorrow this button will connect the AI order summary to verified email, MongoDB orders, Stripe Checkout, and the Admin Dashboard. Today no payment session is created.",
  orderSummary: "Order summary",
  price: "Price",
  delivery: "Delivery",
  errorTitle: "Something went wrong",
  errorText: "This is a prepared demo error state. No data was sent anywhere.",
  clearError: "Clear error",
  removeAttachment: "Remove attachment",
  attachmentTooLarge: "This demo accepts files up to 8 MB.",
  image: "Image",
  file: "File",
  attachmentUploaded: "Attachment uploaded",
  toBeConfirmed: "To be confirmed",
};

const quickActions: { key: Action; labelKey: keyof typeof baseLabels }[] = [
  { key: "build", labelKey: "build" },
  { key: "package", labelKey: "package" },
  { key: "order", labelKey: "order" },
  { key: "unsure", labelKey: "unsure" },
  { key: "features", labelKey: "featuresAction" },
  { key: "process", labelKey: "processAction" },
];


function ArrowUpRightIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.arrowIcon} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14 14 6" /><path d="M8 6h6v6" /></svg>;
}

function SparkleIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className={styles.sparkleIcon}><path d="M10 1.8l1.6 4.7 4.8 1.6-4.8 1.6L10 14.4 8.4 9.7 3.6 8.1l4.8-1.6L10 1.8z" fill="currentColor"/><path d="M15.5 12.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" fill="currentColor" opacity=".65"/></svg>;
}

function fileSize(size: number) {
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function recommendPackage(draft: Draft) {
  const text = Object.values(draft).join(" ").toLowerCase();
  if (text.includes("store") || text.includes("shop") || text.includes("product") || text.includes("payment")) return fixedPackages.find((item) => item.checkoutId === "online-store-standard") ?? fixedPackages[0];
  if (text.includes("10") || text.includes("many") || text.includes("advanced")) return fixedPackages.find((item) => item.checkoutId === "business-plus") ?? fixedPackages[0];
  if (text.includes("restaurant") || text.includes("booking") || text.includes("menu")) return fixedPackages.find((item) => item.checkoutId === "business-website") ?? fixedPackages[0];
  if (text.includes("one") || text.includes("landing")) return fixedPackages.find((item) => item.checkoutId === "one-page-website") ?? fixedPackages[0];
  return fixedPackages.find((item) => item.checkoutId === "small-website") ?? fixedPackages[0];
}

export default function BlueMindAIExperience({ buttonClassName }: { buttonClassName: string }) {
  const { locale, translate } = useLocalization();
  const labels = useMemo(() => Object.fromEntries(Object.entries(baseLabels).map(([key, value]) => [key, translate(value)])) as typeof baseLabels, [translate]);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [sending, setSending] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");
  const [step, setStep] = useState<Step>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [checkoutPreview, setCheckoutPreview] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const nextId = useRef(1);
  const messagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recommended = useMemo(() => recommendPackage(draft), [draft]);
  const hasConversation = messages.length > 0 || step !== null;
  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, checkoutPreview, errorVisible]);

  function addMessage(role: Message["role"], text: string, sentAttachments?: AttachmentItem[]) {
    setMessages((current) => [...current, { id: nextId.current++, role, text, attachments: sentAttachments }]);
  }
  function reply(text: string, after?: () => void) {
    setSending(true);
    window.setTimeout(() => { addMessage("ai", text); setSending(false); after?.(); }, 650);
  }
  function resetConversation() {
    setMessages([]); setInput(""); setAttachments([]); setAttachmentError(""); setStep(null); setDraft({}); setCheckoutPreview(false); setErrorVisible(false); nextId.current = 1;
  }
  function start(action: Action) {
    setOpen(true); setCheckoutPreview(false); setErrorVisible(false);
    setInput(""); setAttachments([]); setAttachmentError(""); setStep(null);
    const actionLabels = { build: labels.build, package: labels.package, order: labels.order, unsure: labels.unsure, features: labels.featuresAction, process: labels.processAction };
    addMessage("user", actionLabels[action]);
    if (action === "build" || action === "order") { setDraft({}); setStep("websiteType"); reply(action === "build" ? labels.buildReply : labels.orderReply); return; }
    if (action === "package") { reply(labels.packageReply); return; }
    if (action === "features") { reply(labels.featuresReply); return; }
    if (action === "process") { reply(labels.processReply); return; }
    reply(labels.unsureReply);
  }
  function activeStep() { return steps.find((item) => item.key === step); }
  function nextStep(current: Step): Step { const index = steps.findIndex((item) => item.key === current); return steps[index + 1]?.key ?? "complete"; }
  function answerFlow(value: string) {
    if (!step || step === "complete") return false;
    const updated = { ...draft, [step]: value };
    setDraft(updated); addMessage("user", value, attachments.length ? attachments : undefined); setAttachments([]);
    const next = nextStep(step);
    if (next === "complete") { setStep("complete"); reply(labels.summaryReady); }
    else { setStep(next); reply(steps.find((item) => item.key === next)?.question ?? labels.genericReply); }
    return true;
  }
  function send(value = input.trim()) {
    if (!value && !attachments.length) return;
    const content = value || attachments.map((item) => item.name).join(", ") || labels.attachmentUploaded;
    setInput("");
    if (answerFlow(content)) return;
    addMessage("user", content, attachments.length ? attachments : undefined); setAttachments([]); reply(labels.genericReply);
  }
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); }
  }
  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    setAttachmentError("");
    const files = Array.from(event.target.files ?? []);
    const valid = files.filter((file) => file.size <= maxAttachmentSize).map((file) => ({ id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name, kind: file.type.startsWith("image/") ? "image" as const : "file" as const, size: fileSize(file.size) }));
    if (valid.length !== files.length) setAttachmentError(labels.attachmentTooLarge);
    setAttachments((current) => [...current, ...valid].slice(0, 4));
    event.currentTarget.value = "";
  }

  const current = activeStep();
  const overlay = open ? (
    <div className={styles.overlayRoot} data-locale={locale}>
      <div className={styles.backdrop} onClick={() => setOpen(false)} />
      <section className={[styles.shell, maximized ? styles.maximized : ""].join(" ")} role="dialog" aria-modal="true" aria-label={labels.brand} dir={dir}>
        <header className={styles.header}>
          <div className={styles.controls}><button type="button" aria-label={labels.close} onClick={() => setOpen(false)}><span aria-hidden="true">x</span></button><button type="button" aria-label={maximized ? labels.restore : labels.maximize} onClick={() => setMaximized((value) => !value)}><span aria-hidden="true">{maximized ? "[]" : "[ ]"}</span></button></div>
          <div className={styles.headerBrand}><SparkleIcon /><span>{labels.brand}</span></div>
          <button type="button" className={styles.newButton} onClick={resetConversation}>{labels.newConversation}</button>
        </header>
        <div className={styles.content}>
          <div className={[styles.welcome, hasConversation ? styles.compactWelcome : ""].join(" ")}><img src="/images/brand/bluemind-ai-logo.svg" alt="" className={styles.aiLogo} /><h2>{labels.brand}</h2><p>{labels.welcome}</p><small>{labels.demo}</small></div>
          <div className={styles.messages} ref={messagesRef} aria-live="polite">
            {!messages.length && !sending && <article className={[styles.message, styles.aiMessage].join(" ")}><p>{labels.welcomeReply}</p></article>}
            {messages.map((message) => <article key={message.id} className={[styles.message, message.role === "user" ? styles.userMessage : styles.aiMessage].join(" ")}><p>{message.text}</p>{message.attachments?.length ? <ul className={styles.sentAttachments}>{message.attachments.map((item) => <li key={item.id}>{item.kind === "image" ? labels.image : labels.file}: {item.name}</li>)}</ul> : null}</article>)}
            {sending && <article className={[styles.message, styles.aiMessage, styles.loading].join(" ")}><span /><span /><span /><p>{labels.sending}</p></article>}
            {current?.suggestions && !sending && <div className={styles.suggestions}>{current.suggestions.map((item) => <button type="button" key={item} onClick={() => { setInput(""); answerFlow(item); }}>{item}</button>)}</div>}
            {step === "complete" && <OrderSummary labels={labels} draft={draft} recommended={recommended} onEdit={() => { setStep("websiteType"); setCheckoutPreview(false); }} onCheckout={() => setCheckoutPreview(true)} />}
            {checkoutPreview && <article className={styles.previewCard}><h3>{labels.checkoutTitle}</h3><p>{labels.checkoutText}</p><dl><div><dt>{labels.packageLabel}</dt><dd>{recommended.title}</dd></div><div><dt>{labels.price}</dt><dd>{recommended.price}</dd></div><div><dt>{labels.delivery}</dt><dd>{recommended.delivery}</dd></div></dl></article>}
            {errorVisible && <article className={styles.errorCard}><h3>{labels.errorTitle}</h3><p>{labels.errorText}</p><button type="button" onClick={() => setErrorVisible(false)}>{labels.clearError}</button></article>}
          </div>
          <div className={styles.quickActions}>{quickActions.map((item) => <button type="button" key={item.key} onClick={() => start(item.key)}>{labels[item.labelKey]}</button>)}</div>
          <footer className={styles.composerWrap}>{(attachments.length > 0 || attachmentError) && <div className={styles.attachmentRow}>{attachments.map((item) => <span key={item.id} className={styles.attachmentPill}>{item.kind === "image" ? "IMG" : "FILE"} {item.name} <small>{item.size}</small><button type="button" aria-label={labels.removeAttachment + ": " + item.name} onClick={() => setAttachments((currentItems) => currentItems.filter((existing) => existing.id !== item.id))}>x</button></span>)}{attachmentError && <strong>{attachmentError}</strong>}</div>}<div className={styles.composerBar}><button type="button" className={styles.attachButton} aria-label={labels.attach} onClick={() => fileInputRef.current?.click()}>+</button><div className={styles.inputShell}><textarea value={input} rows={1} placeholder={labels.placeholder} onChange={(event) => setInput(event.target.value)} onKeyDown={keyDown} /><button type="button" className={styles.sendButton} aria-label={labels.send} onClick={() => send()}><ArrowUpRightIcon /></button><input ref={fileInputRef} className={styles.fileInput} type="file" accept="image/*,.pdf,.doc,.docx,.txt" multiple onChange={chooseFiles} /></div></div></footer>
        </div>
      </section>
    </div>
  ) : null;
  return <><button type="button" className={`${buttonClassName} ${styles.askButton}`} onClick={() => setOpen(true)}><SparkleIcon /><span>{labels.ask}</span></button>{mounted && overlay ? createPortal(overlay, document.body) : null}</>;
}

function OrderSummary({ labels, draft, recommended, onEdit, onCheckout }: { labels: Record<string, string>; draft: Draft; recommended: typeof fixedPackages[number]; onEdit: () => void; onCheckout: () => void }) {
  const rows = [[labels.project, draft.projectName || "BlueMind Project"], [labels.websiteType, draft.websiteType || "Website"], [labels.pages, draft.pages || labels.toBeConfirmed], [labels.features, draft.features || labels.toBeConfirmed], [labels.style, draft.style || labels.toBeConfirmed], [labels.domain, draft.domain || labels.toBeConfirmed], [labels.logo, draft.logo || labels.toBeConfirmed]];
  return <article className={styles.summaryCard}><div><p>{labels.orderSummary}</p><h3>{labels.summaryTitle}</h3></div><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}<div><dt>{labels.packageLabel}</dt><dd>{recommended.title} - {recommended.price}</dd></div></dl><div className={styles.summaryActions}><button type="button" onClick={onEdit}>{labels.edit}</button><button type="button" onClick={onCheckout}>{labels.checkout}</button></div></article>;
}
