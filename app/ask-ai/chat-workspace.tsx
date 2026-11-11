"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Camera, File, Home, ImageIcon, Menu, MessageCircle, MessageSquare, PanelLeftClose, PanelLeftOpen, Plus, Settings, Sparkles, Square, SquarePen, X } from "lucide-react";
import { BlueMindLogo } from "../../components/blue-mind-logo";
import { AI_LIMITS, boundedContext, type AiErrorCode } from "../lib/ai/contract";
import { ChatRequestError, requestReply } from "../lib/ai/client";
import { AssistantMessage } from "./assistant-message";
import { useChatScroll } from "./use-chat-scroll";
import type { Feedback } from "./message-actions";
import { messageCardText, validateMessageCard, type MessageCardContent } from "../lib/ai/message-card";
import styles from "./chat-workspace.module.css";
import { AttachmentList, ImageViewer } from "./attachments";
import { FILE_LIMITS, documentAccept, imageAccept, readAttachment, wireAttachment, type LocalAttachment } from "../lib/ai/attachments";
import { attachmentErrorMessage, chatCopy } from "./chat-copy";
import { useLocalization } from "../../components/localization-provider";

type Message = { id: string; text: string; role: "user" | "assistant"; complete: boolean; stopped?: boolean; feedback?: Feedback; card?: MessageCardContent; attachments?: LocalAttachment[] };
type GuidedSource = "what-we-build";
type Conversation = { id: string; title: string; messages: Message[]; source?: GuidedSource; error?: AiErrorCode; retryMessageId?: string };
type RunningReply = {
  conversationId: string; controller: AbortController; assistantId: string; replaced?: Message;
  timeout?: number; thinkingTimer?: number; networkDone: boolean; visible: string;
};
const THINKING_MIN_MS = 2000;
const guidedWelcome: Record<"en" | "ar" | "sv", string> = {
  en: "What website idea do you have in mind? Tell me about it in your own way. We’ll organize it together, define what you want the website to include, and prepare your request step by step.",
  ar: "شو فكرة الموقع اللي ببالك؟ احكيلي عنها بطريقتك. منرتّبها سوا، ومنحدّد شو بدك يكون بالموقع، ومنجهّز طلبك خطوة بخطوة.",
  sv: "Vilken webbplatsidé har du i åtanke? Berätta om den med dina egna ord. Vi organiserar den tillsammans, bestämmer vad webbplatsen ska innehålla och förbereder din förfrågan steg för steg.",
};
const guidedContext: Record<GuidedSource, string> = {
  "what-we-build": "The visitor opened BlueMind AI from the What We Build section because they want to discuss a special website idea. Help them explain and organize the idea, clarify requirements, and prepare a request for the BlueMind Web Service team. Do not claim that AI builds the website itself. Before any request is sent to the team, let the visitor review and approve it.",
};

function serverConversation(value: unknown): Conversation | null {
  if (!value || typeof value !== "object") return null;
  const source = (value as { source?: unknown }).source === "what-we-build" ? "what-we-build" : undefined;
  const rawMessages = (value as { messages?: unknown }).messages;
  if (!Array.isArray(rawMessages)) return null;
  const messages = rawMessages.flatMap((item, index): Message[] => {
    if (!item || typeof item !== "object") return [];
    const message = item as { id?: unknown; role?: unknown; content?: unknown; attachments?: unknown; card?: unknown };
    if ((message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string") return [];
    const attachments = Array.isArray(message.attachments) ? message.attachments.flatMap((file, fileIndex) => {
      if (!file || typeof file !== "object") return [];
      const value = file as { name?: unknown; type?: unknown; data?: unknown };
      if (typeof value.name !== "string" || typeof value.type !== "string" || typeof value.data !== "string") return [];
      return [{ id: typeof message.id === "string" ? `${message.id}-${fileIndex}` : crypto.randomUUID(), name: value.name, type: value.type, data: value.data, size: 0 } as LocalAttachment];
    }) : [];
    const card = message.role === "assistant" ? validateMessageCard(message.card) : null;
    return [{ id: typeof message.id === "string" ? message.id : crypto.randomUUID(), role: message.role, text: message.content, complete: true, ...(attachments.length ? { attachments } : {}), ...(card ? { card } : {}) }];
  });
  if (!messages.length) return null;
  const id = typeof (value as { id?: unknown }).id === "string" ? (value as { id: string }).id : "";
  if (!id) return null;
  return { id, title: typeof (value as { title?: unknown }).title === "string" ? (value as { title: string }).title : "Website idea", messages, ...(source ? { source } : {}) };
}

function History({ conversations, activeId, compact = false, onSelect, onNew, accountAuthenticated, accountMode = false }: {
  conversations: Conversation[]; activeId: string | null; compact?: boolean;
  onSelect: (id: string) => void; onNew: () => void; accountAuthenticated: boolean | null; accountMode?: boolean;
}) {
  const { locale } = useLocalization();
  const copy = chatCopy[locale];
  function startChat() {
    onNew();
  }
  return <>
    <button className={styles.newChat} type="button" onClick={startChat} title={copy.newChat} aria-label={copy.newChat}>
      <SquarePen size={20} aria-hidden="true" /><span hidden={compact}>{copy.newChat}</span>
    </button>
    {accountMode && !compact && <nav className={styles.accountMenuNav} aria-label={copy.accountNavigation}>
      <Link href="/dashboard"><Home size={17} aria-hidden="true" /><span>{copy.home}</span></Link>
      <Link href="/blue-mind-ai" aria-current="page"><Sparkles size={17} aria-hidden="true" /><span>BlueMind AI</span></Link>
      <Link href="/notifications"><MessageCircle size={17} aria-hidden="true" /><span>{copy.messages}</span></Link>
      <Link href="/account"><Settings size={17} aria-hidden="true" /><span>{copy.account}</span></Link>
    </nav>}
    <nav className={styles.history} aria-label={copy.conversations}>
      {!compact && <p className={styles.historyLabel}>{copy.conversations}</p>}
      {!compact && accountAuthenticated === false && activeId && <Link className={styles.saveChatLink} href={`/sign-in?returnTo=${encodeURIComponent(`/blue-mind-ai?conversation=${activeId}`)}`}><span>{copy.saveChat}</span><ArrowUp size={15} aria-hidden="true" /></Link>}
      {conversations.map(conversation => <button key={conversation.id} type="button" className={styles.historyItem}
        aria-current={activeId === conversation.id ? "page" : undefined} aria-label={conversation.title} title={conversation.title}
        onClick={() => onSelect(conversation.id)}>
        <MessageSquare size={18} aria-hidden="true" /><span hidden={compact}>{conversation.title}</span>
      </button>)}
    </nav>
  </>;
}

export default function ChatWorkspace({ available, embedded = false, account = false, accountFullScreen = false }: { available: boolean; embedded?: boolean; account?: boolean; accountFullScreen?: boolean }) {
  const { locale } = useLocalization();
  const copy = chatCopy[locale];
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [accountAuthenticated, setAccountAuthenticated] = useState<boolean | null>(null);
  const [draft, setDraft] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [files, setFiles] = useState<LocalAttachment[]>([]);
  const [fileError, setFileError] = useState("");
  const [preparing, setPreparing] = useState<number | null>(null);
  const [viewing, setViewing] = useState<LocalAttachment | null>(null);
  const fileRead = useRef<AbortController | null>(null);
  const imagePicker = useRef<HTMLInputElement>(null);
  const documentPicker = useRef<HTMLInputElement>(null);
  const cameraPicker = useRef<HTMLInputElement>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [animatedId, setAnimatedId] = useState<string | null>(null);
  const [thinkingReply, setThinkingReply] = useState<{ id: string; replacedId?: string; ready: boolean } | null>(null);
  const request = useRef<RunningReply | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const composer = useRef<HTMLFormElement>(null);
  const sourceFromQuery = useRef<GuidedSource | null>(null);
  const { viewport: history, content: messageList, followBottom } = useChatScroll(activeId);
  const drawer = useRef<HTMLDialogElement>(null);
  const attachmentArea = useRef<HTMLDivElement>(null);
  const attachmentTrigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  function openDrawer() {
    drawer.current?.showModal();
    setDrawerOpen(true);
  }

  function closeDrawer() {
    drawer.current?.close();
    setDrawerOpen(false);
  }

  function syncConversationUrl(id: string | null) {
    const params = new URLSearchParams(window.location.search);
    if (id) params.set("conversation", id);
    else params.delete("conversation");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  useEffect(() => {
    try { setDraft(sessionStorage.getItem("bluemind-ai-draft") || ""); } catch {}
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    try {
      if (draft) sessionStorage.setItem("bluemind-ai-draft", draft);
      else sessionStorage.removeItem("bluemind-ai-draft");
    } catch {}
  }, [draft, draftReady]);

  const active = conversations.find(conversation => conversation.id === activeId);
  const messages = active?.messages ?? [];
  const hasMessages = messages.length > 0;
  const pending = pendingId === activeId && pendingId !== null;
  const incoming = messages.find(message => message.id === animatedId);
  const thinking = thinkingReply?.id === animatedId && (pending || incoming?.complete === true);
  const contentArrived = Boolean(incoming?.text || incoming?.card);
  const thinkingTarget = thinking ? incoming?.id ?? thinkingReply?.replacedId ?? animatedId : null;
  // Keep the waiting placeholder in the same keyed slot when the first chunk arrives.
  const visibleMessages: Message[] = thinking && thinkingTarget && !messages.some(message => message.id === thinkingTarget)
    ? [...messages, { id: thinkingTarget, role: "assistant", text: "", complete: false }] : messages;
  const actionHandlers = useRef({ regenerate, setFeedback, saveCard });
  useLayoutEffect(() => { actionHandlers.current = { regenerate, setFeedback, saveCard }; });
  const onRegenerate = useCallback((id: string) => actionHandlers.current.regenerate(id), []);
  const onFeedback = useCallback((id: string, feedback: Feedback) => actionHandlers.current.setFeedback(id, feedback), []);
  const onSaveCard = useCallback((id: string, card: MessageCardContent) => actionHandlers.current.saveCard(id, card), []);
  const onPresented = useCallback((id: string, visible: string, finished: boolean) => {
    const running = request.current;
    if (!running || running.assistantId !== id || running.controller.signal.aborted) return;
    // Track committed text, not buffered chunks or a scheduled typing frame.
    running.visible = visible;
    if (finished && running.networkDone) {
      request.current = null;
      window.clearTimeout(running.thinkingTimer);
      setPendingId(null);
    }
  }, []);

  useEffect(() => {
    fetch("/api/customer/session", { credentials: "same-origin", cache: "no-store" }).then(response => setAccountAuthenticated(response.ok)).catch(() => setAccountAuthenticated(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const persistedId = params.get("conversation");
    if (persistedId) {
      let active = true;
      fetch(`/api/ai/conversations/${encodeURIComponent(persistedId)}`, { credentials: "same-origin", cache: "no-store" }).then(async response => {
        if (!response.ok) throw new Error("conversation");
        const value = serverConversation((await response.json()).conversation);
        if (active && value) { setConversations([value]); setActiveId(value.id); }
      }).catch(() => { if (active) setConversations([]); });
      return () => { active = false; };
    }
    if (params.get("continue") === "1") {
      try {
        const stored = sessionStorage.getItem("bluemind-ai-demo-transfer");
        const value = stored ? JSON.parse(stored) : null;
        if (value?.source === "what-we-build" && Array.isArray(value.messages) && value.messages.length) {
          const transferred = (value.messages as unknown[]).filter((message: unknown): message is Message => Boolean(message && typeof message === "object"
            && ((message as Message).role === "user" || (message as Message).role === "assistant") && typeof (message as Message).text === "string"))
            .map((message: Message) => ({ ...message, id: crypto.randomUUID(), complete: true }));
          if (transferred.length) {
            const id = crypto.randomUUID();
            setConversations([{ id, title: transferred.find(message => message.role === "user")?.text.slice(0, 80) || "Website idea", source: "what-we-build", messages: transferred }]);
            setActiveId(id);
            sessionStorage.removeItem("bluemind-ai-demo-transfer");
            return;
          }
        }
      } catch { sessionStorage.removeItem("bluemind-ai-demo-transfer"); }
    }
    if (params.get("source") !== "what-we-build" || params.get("new") !== "1") return;
    const language = document.documentElement.lang.split("-")[0];
    const locale = language === "ar" || language === "sv" ? language : "en";
    const id = crypto.randomUUID();
    sourceFromQuery.current = "what-we-build";
    setConversations([{ id, title: locale === "ar" ? "فكرة موقع جديدة" : locale === "sv" ? "Ny webbplatsidé" : "New website idea", source: "what-we-build", messages: [{
      id: crypto.randomUUID(), role: "assistant", text: guidedWelcome[locale], complete: true,
    }] }]);
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (accountAuthenticated !== true || new URLSearchParams(window.location.search).has("conversation")) return;
    let active = true;
    fetch("/api/ai/conversations", { credentials: "same-origin", cache: "no-store" }).then(async response => {
      if (!response.ok) return;
      const value = await response.json();
      const loaded = Array.isArray(value.conversations) ? value.conversations.map((item: unknown) => ({ ...(item as Conversation), messages: [] })) : [];
      if (active && loaded.length) setConversations(loaded);
    }).catch(() => {});
    return () => { active = false; };
  }, [accountAuthenticated]);

  useEffect(() => {
    if (!thinking || !contentArrived || !thinkingReply?.ready) return;
    setThinkingReply(current => current?.id === animatedId ? null : current);
  }, [thinking, contentArrived, animatedId, thinkingReply?.ready]);

  useEffect(() => () => {
    const running = request.current;
    request.current = null;
    window.clearTimeout(running?.timeout);
    window.clearTimeout(running?.thinkingTimer);
    running?.controller.abort();
    fileRead.current?.abort();
  }, []);

  useEffect(() => {
    if (embedded) return;
    const viewport = window.visualViewport;
    if (!viewport) return;
    // Keep the composer inside the visible viewport when a mobile keyboard opens.
    const resize = () => {
      if (!root.current || viewport.scale !== 1) return;
      const top = account ? Math.max(0, root.current.getBoundingClientRect().top) : 0;
      root.current.style.setProperty("--chat-height", `${Math.max(320, viewport.height - top)}px`);
      if (!account) root.current.style.setProperty("--chat-top", `${viewport.offsetTop}px`);
    };
    resize();
    viewport.addEventListener("resize", resize);
    viewport.addEventListener("scroll", resize);
    return () => {
      viewport.removeEventListener("resize", resize);
      viewport.removeEventListener("scroll", resize);
    };
  }, [embedded]);

  useLayoutEffect(() => {
    if (!input.current) return;
    input.current.style.height = "0px";
    input.current.style.height = `${Math.min(input.current.scrollHeight, 180)}px`;
  }, [draft]);

  useEffect(() => {
    const media = matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (media.matches) closeDrawer(); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!attachmentsOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!attachmentArea.current?.contains(event.target as Node)) setAttachmentsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setAttachmentsOpen(false); attachmentTrigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [attachmentsOpen]);

  function chooseConversation(id: string | null) {
    const selected = conversations.find(conversation => conversation.id === id);
    if (id && selected && !selected.messages.length) {
      fileRead.current?.abort(); fileRead.current = null;
      setFiles([]); setFileError(""); setPreparing(null); setViewing(null);
      setAnimatedId(null); setThinkingReply(null); setDraft(""); setAttachmentsOpen(false); closeDrawer();
      void fetch(`/api/ai/conversations/${encodeURIComponent(id)}`, { credentials: "same-origin", cache: "no-store" }).then(async response => {
        if (!response.ok) throw new Error("conversation");
        const loaded = serverConversation((await response.json()).conversation);
        if (!loaded) throw new Error("conversation");
        setConversations(current => current.map(conversation => conversation.id === id ? loaded : conversation));
        setActiveId(id);
        syncConversationUrl(id);
      }).catch(() => {});
      return;
    }
    fileRead.current?.abort(); fileRead.current = null;
    setFiles([]); setFileError(""); setPreparing(null); setViewing(null);
    setAnimatedId(null);
    setThinkingReply(null);
    const running = request.current;
    if (running) {
      request.current = null;
      window.clearTimeout(running.timeout);
      window.clearTimeout(running.thinkingTimer);
      running.controller.abort();
      setPendingId(null);
      setConversations(current => current.map(conversation => conversation.id === running.conversationId
        ? freezeReply(conversation, running, true) : conversation));
    }
    setActiveId(id);
    syncConversationUrl(id);
    if (id === null) sourceFromQuery.current = null;
    setDraft("");
    setAttachmentsOpen(false);
    closeDrawer();
  }

  function restoreReply(conversation: Conversation, running: RunningReply, error: AiErrorCode): Conversation {
    return { ...freezeReply(conversation, running, true), error, retryMessageId: running.replaced?.id };
  }

  function freezeReply(conversation: Conversation, running: RunningReply, restoreReplaced = false): Conversation {
    return { ...conversation, error: undefined, retryMessageId: undefined,
      messages: conversation.messages.flatMap(message => {
        if (message.id !== running.assistantId) return [message];
        if (running.replaced && (restoreReplaced || !running.visible)) return [running.replaced];
        return running.visible ? [{ ...message, text: running.visible, card: undefined, stopped: true, complete: false }] : [];
      }) };
  }

  function stopReply() {
    const running = request.current;
    if (!running) return;
    // Invalidate first: late chunks/finalizers must not affect this or the next request.
    request.current = null;
    window.clearTimeout(running.timeout);
    window.clearTimeout(running.thinkingTimer);
    running.controller.abort();
    setPendingId(null);
    setAnimatedId(null);
    setThinkingReply(null);
    setConversations(current => current.map(conversation => conversation.id === running.conversationId
      ? freezeReply(conversation, running) : conversation));
  }

  async function reply(id: string, conversationMessages: Message[], replaced?: Message, source?: GuidedSource) {
    if (request.current) return;
    const assistantId = crypto.randomUUID();
    const running: RunningReply = { conversationId: id, controller: new AbortController(), assistantId, replaced, networkDone: false, visible: "" };
    request.current = running;
    setPendingId(id);
    setAnimatedId(assistantId);
    setThinkingReply({ id: assistantId, replacedId: replaced?.id, ready: false });
    running.thinkingTimer = window.setTimeout(() => {
      if (request.current === running && !running.controller.signal.aborted) {
        setThinkingReply(current => current?.id === assistantId ? { ...current, ready: true } : current);
      }
    }, THINKING_MIN_MS);
    running.timeout = window.setTimeout(() => running.controller.abort(), 65000);
    setConversations(current => current.map(conversation => conversation.id === id ? { ...conversation, error: undefined, retryMessageId: undefined } : conversation));
    try {
      const turns = conversationMessages.filter(message => message.complete || (message.stopped && message.text.trim())).map(message => ({ id: message.id, role: message.role,
        content: message.card ? [message.text, messageCardText(message.card)].filter(Boolean).join("\n\n") : message.text,
        ...(message.attachments?.length ? { attachments: message.attachments.map(wireAttachment) } : {}) }));
      while (turns[0]?.role === "assistant") turns.shift();
      const activeSource = source ?? conversations.find(conversation => conversation.id === id)?.source;
      const firstUser = turns.findIndex(turn => turn.role === "user");
      if (activeSource && firstUser >= 0) turns[firstUser] = {
        ...turns[firstUser],
        content: `[BlueMind conversation context]\n${guidedContext[activeSource]}\n\nVisitor message:\n${turns[firstUser].content}`,
      };
      const context = boundedContext(turns);
      if (turns.some(turn => turn.attachments?.length && !context.includes(turn))) throw new ChatRequestError("attachment_context");
      await requestReply(context, running.controller.signal, delta => {
        if (request.current !== running || running.controller.signal.aborted) return;
        setConversations(current => current.map(conversation => {
          if (conversation.id !== id) return conversation;
          const exists = conversation.messages.some(message => message.id === assistantId);
          const next: Message = { id: assistantId, role: "assistant", text: delta, complete: false };
          return { ...conversation, messages: exists
            ? conversation.messages.map(message => message.id === assistantId ? { ...message, text: message.text + delta } : message)
            : replaced ? conversation.messages.map(message => message.id === replaced.id ? next : message)
            : [...conversation.messages, next] };
        }));
      }, card => {
        if (request.current !== running || running.controller.signal.aborted) return;
        setConversations(current => current.map(conversation => {
          if (conversation.id !== id) return conversation;
          const exists = conversation.messages.some(message => message.id === assistantId);
          const next: Message = { id: assistantId, role: "assistant", text: "", card, complete: false };
          return { ...conversation, messages: exists
            ? conversation.messages.map(message => message.id === assistantId ? { ...message, card } : message)
            : replaced ? conversation.messages.map(message => message.id === replaced.id ? next : message)
            : [...conversation.messages, next] };
        }));
      }, { conversationId: id, source: activeSource });
      if (request.current === running) {
        running.networkDone = true;
        setConversations(current => current.map(conversation => conversation.id === id
          ? { ...conversation, messages: conversation.messages.map(message => message.id === assistantId ? { ...message, complete: true } : message) } : conversation));
      }
    } catch (error) {
      if (request.current === running) {
        const code = running.controller.signal.aborted ? "timeout" : error instanceof ChatRequestError ? error.code : "failed";
        request.current = null;
        running.controller.abort();
        window.clearTimeout(running.thinkingTimer);
        setPendingId(null);
        setAnimatedId(null);
        setThinkingReply(null);
        setConversations(current => current.map(conversation => conversation.id === id ? restoreReply(conversation, running, code) : conversation));
      }
    } finally {
      window.clearTimeout(running.timeout);
      // Successful requests remain cancellable until the buffered presentation finishes.
    }
  }

  function send() {
    const text = draft.trim();
    if ((!text && !files.length) || text.length > AI_LIMITS.messageChars || request.current || fileRead.current) return;
    followBottom();
    const message: Message = { id: crypto.randomUUID(), text, role: "user", complete: true, ...(files.length ? { attachments: files } : {}) };
    const id = activeId ?? crypto.randomUUID();
    const source = active?.source ?? sourceFromQuery.current ?? undefined;
    const conversationMessages = [...messages, message];
    if (activeId) {
      setConversations(current => current.map(conversation => conversation.id === activeId
        ? { ...conversation, messages: [...conversation.messages, message] } : conversation));
    } else {
      setConversations(current => [{ id, title: (text || files[0]?.name || "Attachments").replace(/\s+/g, " ").slice(0, 80), messages: [message], ...(source ? { source } : {}) }, ...current]);
      setActiveId(id);
    }
    syncConversationUrl(id);
    setDraft("");
    setFiles([]); setFileError("");
    setAttachmentsOpen(false);
    input.current?.focus();
    void reply(id, conversationMessages, undefined, source);
  }

  async function selectFiles(selected: FileList | null) {
    if (!selected?.length || fileRead.current) return;
    setAttachmentsOpen(false); setFileError("");
    const incoming = Array.from(selected);
    const existing = messages.flatMap(message => message.attachments || []).concat(files);
    if (existing.length + incoming.length > FILE_LIMITS.count || existing.reduce((sum, file) => sum + file.size, 0) + incoming.reduce((sum, file) => sum + file.size, 0) > FILE_LIMITS.totalBytes) {
      setFileError(copy.attachmentLimit); return;
    }
    const stored = conversations.flatMap(conversation => conversation.messages.flatMap(message => message.attachments || [])).reduce((sum, file) => sum + file.size, 0);
    if (stored + files.reduce((sum, file) => sum + file.size, 0) + incoming.reduce((sum, file) => sum + file.size, 0) > 20 * 1024 * 1024) {
      setFileError(copy.attachmentSessionLimit); return;
    }
    const controller = new AbortController(); fileRead.current = controller; setPreparing(0);
    try {
      const loaded: LocalAttachment[] = [];
      for (let i = 0; i < incoming.length; i++) loaded.push(await readAttachment(incoming[i], controller.signal, progress => {
        if (fileRead.current === controller) setPreparing(Math.round((i + progress / 100) / incoming.length * 100));
      }));
      if (fileRead.current === controller && !controller.signal.aborted) setFiles(current => [...current, ...loaded]);
    } catch (error) {
      if (fileRead.current === controller && !controller.signal.aborted) setFileError(attachmentErrorMessage(error, locale));
    } finally {
      if (fileRead.current === controller) { fileRead.current = null; setPreparing(null); }
    }
  }

  function retry() {
    if (!active || request.current) return;
    if (active.retryMessageId) { regenerate(active.retryMessageId); return; }
    followBottom();
    const completeMessages = active.messages.filter(message => message.complete || (message.stopped && message.text.trim()));
    setConversations(current => current.map(conversation => conversation.id === active.id ? { ...conversation, messages: completeMessages } : conversation));
    void reply(active.id, completeMessages, undefined, active.source);
  }

  function regenerate(messageId: string) {
    if (!active || request.current) return;
    const index = active.messages.findIndex(message => message.id === messageId);
    const previous = active.messages[index];
    if (!previous?.complete || previous.role !== "assistant" || active.messages[index - 1]?.role !== "user") return;
    // Exclude the old answer and all later turns from this request; retain them in the UI.
    void reply(active.id, active.messages.slice(0, index), previous, active.source);
  }

  function setFeedback(messageId: string, feedback: Feedback) {
    setConversations(current => current.map(conversation => conversation.id === activeId
      ? { ...conversation, messages: conversation.messages.map(message => message.id === messageId ? { ...message, feedback } : message) } : conversation));
  }

  function saveCard(messageId: string, value: MessageCardContent) {
    const card = validateMessageCard(value);
    if (!card) return;
    setConversations(current => current.map(conversation => conversation.id === activeId
      ? { ...conversation, messages: conversation.messages.map(message => message.id === messageId && message.card && message.complete
        && message.text.length + messageCardText(card).length + 2 <= AI_LIMITS.assistantChars ? { ...message, card } : message) } : conversation));
  }

  const historyProps = { conversations, activeId, onSelect: chooseConversation, onNew: () => chooseConversation(null), accountAuthenticated };
  const thinkingIndicator = <div key={`thinking-${animatedId}`} className={styles.assistant} role="status" aria-label="BlueMind AI is preparing a response">
    <div className={styles.thinkingIndicator} data-ready={contentArrived && thinkingReply?.ready} aria-hidden="true"><span className={styles.thinkingDot} /></div>
  </div>;

  return <div ref={root} className={`${styles.chat} ${embedded ? styles.embedded : ""} ${account ? styles.account : ""} ${accountFullScreen ? styles.accountFullScreen : ""}`} data-embedded={embedded || undefined} data-account={account || undefined} data-account-fullscreen={accountFullScreen || undefined} data-collapsed={collapsed} data-welcome={!hasMessages} data-no-translate dir={locale === "ar" ? "rtl" : "ltr"}>
    <aside id="ai-chat-sidebar" className={styles.sidebar} aria-label={copy.chatSidebar}>
      <div className={styles.sidebarTop}>
        <span className={styles.sidebarTitle}>BlueMind AI</span>
        <button className={`${styles.iconControl} ${styles.sidebarToggle}`} type="button" onClick={() => setCollapsed(value => !value)}
        aria-label={collapsed ? copy.expandSidebar : copy.collapseSidebar} title={collapsed ? copy.expandSidebar : copy.collapseSidebar} aria-expanded={!collapsed} aria-controls="ai-chat-sidebar">
        {collapsed && <BlueMindLogo className={styles.toggleLogo} solid />}
        {collapsed ? <PanelLeftOpen className={styles.toggleGlyph} size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
      </button></div>
          <History {...historyProps} compact={collapsed} />
    </aside>

    <dialog id="ai-chat-history" ref={drawer} className={styles.drawer} aria-label={copy.chatSidebar} onClose={() => setDrawerOpen(false)} onCancel={() => setDrawerOpen(false)} onClick={event => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX > bounds.right || event.clientX < bounds.left) closeDrawer();
      }
    }}>
      <div className={styles.drawerInner}>
        <div className={styles.sidebarTop}><button className={styles.iconControl} type="button" aria-label={copy.closeSidebar} title={copy.closeSidebar} onClick={closeDrawer}><X size={20} /></button></div>
        <History {...historyProps} accountMode={accountFullScreen} />
      </div>
    </dialog>

    <main className={styles.main}>
      <div className={styles.topbar}>
        {accountFullScreen ? <>
          <button className={`${styles.iconControl} ${styles.accountMenuButton}`} type="button" aria-label={copy.menu} title={copy.menu} aria-expanded={drawerOpen} aria-controls="ai-chat-history" onClick={openDrawer}><Menu size={21} aria-hidden="true" /></button>
          <Link href="/dashboard" className={styles.accountBrand} aria-label="BlueMind AI">
            <BlueMindLogo className={styles.accountBrandLogo} solid aria-hidden="true" />
            <span>BlueMind</span>
          </Link>
          <span className={styles.accountTopSpacer} aria-hidden="true" />
        </> : <>
          <button className={`${styles.iconControl} ${styles.mobileMenu}`} type="button" aria-label={copy.openSidebar} title={copy.openSidebar} onClick={openDrawer}><Menu size={22} /></button>
          <Link href="/" className={styles.iconControl} aria-label={copy.close} title={copy.close} onNavigate={event => {
            if ((draft.trim() || files.length || preparing !== null) && !window.confirm(copy.discardMessage)) event.preventDefault();
          }}><X size={22} aria-hidden="true" /></Link>
        </>}
      </div>

      <div className={styles.content}>
        <div className={styles.empty} data-hidden={hasMessages} aria-hidden={hasMessages} inert={hasMessages}>
          <BlueMindLogo className={styles.brandSymbol} solid priority />
          <h1>BlueMind AI</h1>
          <p>{copy.heading}</p>
          <p className={styles.emptyIntro}>{copy.intro}</p>
        </div>
        <div ref={history} className={styles.messageScroll} data-active={hasMessages} tabIndex={hasMessages ? 0 : -1} aria-label={copy.message}>
          <div ref={messageList} className={styles.messages} role="log" aria-label={copy.conversation} aria-live="polite" aria-relevant="additions text">
            {visibleMessages.map(message => message.id === thinkingTarget ? thinkingIndicator : message.role === "assistant" ? <AssistantMessage key={message.id} id={message.id}
              text={message.text} card={message.card} complete={message.complete} stopped={message.stopped}
              animate={message.id === animatedId} pending={pending && message.id === animatedId}
              signal={message.id === animatedId ? request.current?.controller.signal : undefined} onPresented={onPresented}
              feedback={message.feedback} generating={pendingId !== null}
              onFeedback={onFeedback} onRegenerate={onRegenerate} onSaveCard={onSaveCard} />
              : <article key={message.id} className={styles.message} data-attachments={Boolean(message.attachments?.length)} aria-label={copy.yourMessage}>
              {message.attachments?.length ? <AttachmentList files={message.attachments} onOpen={setViewing} /> : null}
              {message.text && <div className={styles.messageText}><p dir="auto">{message.text}</p></div>}
            </article>)}
            {active?.error && <div className={styles.replyError} role="alert"><p>{copy.errors[active.error]}</p><button type="button" onClick={retry} disabled={pending}>{copy.retry}</button></div>}
          </div>
        </div>
      </div>

      <div className={styles.composerArea}>
        <div className={styles.suggestionReveal} data-hidden={hasMessages} aria-hidden={hasMessages} inert={hasMessages}>
          <div className={styles.suggestionClip}><div className={styles.suggestions}>
            {copy.suggestions.map(suggestion => <button className={styles.chip} key={suggestion} type="button" onClick={() => { setDraft(suggestion); input.current?.focus(); }}>{suggestion}</button>)}
          </div></div>
        </div>
        <form ref={composer} className={styles.composer} data-files={files.length > 0} onSubmit={event => { event.preventDefault(); send(); }}>
          {files.length > 0 && <div className={styles.attachmentTray}><AttachmentList files={files} onRemove={id => setFiles(current => current.filter(file => file.id !== id))} onOpen={setViewing} /></div>}
          <input ref={imagePicker} type="file" accept={imageAccept} multiple hidden aria-label="Upload images" onChange={event => { void selectFiles(event.target.files); event.target.value = ""; }} />
          <input ref={documentPicker} type="file" accept={documentAccept} multiple hidden aria-label="Upload documents" onChange={event => { void selectFiles(event.target.files); event.target.value = ""; }} />
          <input ref={cameraPicker} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden aria-label="Take a photo" onChange={event => { void selectFiles(event.target.files); event.target.value = ""; }} />
          <div className={styles.attachmentArea} ref={attachmentArea}>
            <button ref={attachmentTrigger} className={styles.iconControl} type="button" aria-label={copy.addAttachment} title={copy.addAttachment} aria-expanded={attachmentsOpen} aria-controls={menuId} onClick={() => setAttachmentsOpen(value => !value)}><Plus size={22} /></button>
            {attachmentsOpen && <div className={styles.attachmentMenu} id={menuId} role="group" aria-label={copy.addAttachment}>
              <button type="button" disabled={preparing !== null} onClick={() => imagePicker.current?.click()}><ImageIcon size={18} />{copy.addImage}</button>
              <button type="button" disabled={preparing !== null} onClick={() => documentPicker.current?.click()}><File size={18} />{copy.addFile}</button>
              <button type="button" disabled={preparing !== null} onClick={() => cameraPicker.current?.click()}><Camera size={18} />{copy.takePhoto}</button>
              <p>{copy.attachmentInfo}</p>
            </div>}
          </div>
          <textarea ref={input} className={styles.input} rows={1} aria-label={copy.message} placeholder={copy.placeholder} value={draft}
            maxLength={AI_LIMITS.messageChars}
            onChange={event => setDraft(event.target.value)} onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); }
            }} />
          {pendingId !== null
            ? <button key="stop" className={styles.primarySend} type="button" onClick={stopReply} aria-label={copy.stopResponse} title={copy.stopResponse}><Square size={16} fill="currentColor" aria-hidden="true" /></button>
            : <button key="send" className={styles.primarySend} type="submit" disabled={(!draft.trim() && !files.length) || preparing !== null} aria-label={copy.sendMessage} title={copy.sendMessage}><ArrowUp size={21} aria-hidden="true" /></button>}
        </form>
        {preparing !== null && <div className={styles.fileStatus} role="status">{copy.preparing}: {preparing}% <button type="button" onClick={() => { fileRead.current?.abort(); fileRead.current = null; setPreparing(null); }}>{copy.cancel}</button></div>}
        {fileError && <div className={styles.fileStatus} role="alert">{fileError}</div>}
        <p className={styles.status} role="status">{available ? copy.availableStatus : copy.unavailableStatus}</p>
      </div>
    </main>
    {viewing && <ImageViewer file={viewing} onClose={() => setViewing(null)} />}
  </div>;
}
