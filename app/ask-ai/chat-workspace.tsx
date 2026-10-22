"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, File, ImageIcon, Menu, MessageSquare, PanelLeftClose, PanelLeftOpen, Plus, SquarePen, X } from "lucide-react";
import { BlueMindLogo } from "../../components/blue-mind-logo";
import { AI_ERRORS, AI_LIMITS, boundedContext, type AiErrorCode } from "../lib/ai/contract";
import { ChatRequestError, requestReply } from "../lib/ai/client";
import { AssistantMessage } from "./assistant-message";
import { useChatScroll } from "./use-chat-scroll";
import styles from "./chat-workspace.module.css";

type Message = { id: string; text: string; role: "user" | "assistant"; complete: boolean };
type Conversation = { id: string; title: string; messages: Message[]; error?: AiErrorCode };
const suggestions = ["Create a website", "Design a page", "Improve my website", "Business ideas", "Help me get started", "Explore our services"];

function History({ conversations, activeId, compact = false, onSelect, onNew }: {
  conversations: Conversation[]; activeId: string | null; compact?: boolean;
  onSelect: (id: string) => void; onNew: () => void;
}) {
  return <>
    <button className={styles.newChat} type="button" onClick={onNew} title="New chat" aria-label="New chat">
      <SquarePen size={20} aria-hidden="true" /><span hidden={compact}>New chat</span>
    </button>
    <nav className={styles.history} aria-label="Conversation history">
      {!compact && <p className={styles.historyLabel}>Conversations</p>}
      {conversations.map(conversation => <button key={conversation.id} type="button" className={styles.historyItem}
        aria-current={activeId === conversation.id ? "page" : undefined} aria-label={conversation.title} title={conversation.title}
        onClick={() => onSelect(conversation.id)}>
        <MessageSquare size={18} aria-hidden="true" /><span hidden={compact}>{conversation.title}</span>
      </button>)}
    </nav>
  </>;
}

export default function ChatWorkspace({ available }: { available: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [animatedId, setAnimatedId] = useState<string | null>(null);
  const request = useRef<{ conversationId: string; controller: AbortController } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const { viewport: history, content: messageList, followBottom } = useChatScroll(activeId);
  const drawer = useRef<HTMLDialogElement>(null);
  const attachmentArea = useRef<HTMLDivElement>(null);
  const attachmentTrigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const active = conversations.find(conversation => conversation.id === activeId);
  const messages = active?.messages ?? [];
  const hasMessages = messages.length > 0;
  const pending = pendingId === activeId && pendingId !== null;

  useEffect(() => () => { request.current?.controller.abort(); request.current = null; }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    // Keep the composer inside the visible viewport when a mobile keyboard opens.
    const resize = () => {
      if (!root.current || viewport.scale !== 1) return;
      root.current.style.setProperty("--chat-height", `${viewport.height}px`);
      root.current.style.setProperty("--chat-top", `${viewport.offsetTop}px`);
    };
    resize();
    viewport.addEventListener("resize", resize);
    viewport.addEventListener("scroll", resize);
    return () => {
      viewport.removeEventListener("resize", resize);
      viewport.removeEventListener("scroll", resize);
    };
  }, []);

  useLayoutEffect(() => {
    if (!input.current) return;
    input.current.style.height = "0px";
    input.current.style.height = `${Math.min(input.current.scrollHeight, 180)}px`;
  }, [draft]);

  useEffect(() => {
    const media = matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (media.matches) drawer.current?.close(); };
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
    setAnimatedId(null);
    const running = request.current;
    if (running) {
      request.current = null;
      running.controller.abort();
      setPendingId(null);
      setConversations(current => current.map(conversation => conversation.id === running.conversationId ? { ...conversation, error: "stopped" } : conversation));
    }
    setActiveId(id);
    setDraft("");
    setAttachmentsOpen(false);
    drawer.current?.close();
  }

  async function reply(id: string, conversationMessages: Message[]) {
    const running = { conversationId: id, controller: new AbortController() };
    request.current = running;
    setPendingId(id);
    const assistantId = crypto.randomUUID();
    setAnimatedId(assistantId);
    const timeout = window.setTimeout(() => running.controller.abort(), 65000);
    setConversations(current => current.map(conversation => conversation.id === id ? { ...conversation, error: undefined } : conversation));
    try {
      const context = boundedContext(conversationMessages.filter(message => message.complete).map(message => ({ role: message.role, content: message.text })));
      await requestReply(context, running.controller.signal, delta => {
        if (request.current !== running) return;
        setConversations(current => current.map(conversation => {
          if (conversation.id !== id) return conversation;
          const exists = conversation.messages.some(message => message.id === assistantId);
          return { ...conversation, messages: exists
            ? conversation.messages.map(message => message.id === assistantId ? { ...message, text: message.text + delta } : message)
            : [...conversation.messages, { id: assistantId, role: "assistant", text: delta, complete: false }] };
        }));
      });
      if (request.current === running) setConversations(current => current.map(conversation => conversation.id === id
        ? { ...conversation, messages: conversation.messages.map(message => message.id === assistantId ? { ...message, complete: true } : message) } : conversation));
    } catch (error) {
      if (request.current === running) {
        const code = running.controller.signal.aborted ? "timeout" : error instanceof ChatRequestError ? error.code : "failed";
        setConversations(current => current.map(conversation => conversation.id === id ? { ...conversation, error: code } : conversation));
      }
    } finally {
      window.clearTimeout(timeout);
      if (request.current === running) { request.current = null; setPendingId(null); }
    }
  }

  function send() {
    const text = draft.trim();
    if (!text || text.length > AI_LIMITS.messageChars || request.current) return;
    followBottom();
    const message: Message = { id: crypto.randomUUID(), text, role: "user", complete: true };
    const id = activeId ?? crypto.randomUUID();
    const conversationMessages = [...messages, message];
    if (activeId) {
      setConversations(current => current.map(conversation => conversation.id === activeId
        ? { ...conversation, messages: [...conversation.messages, message] } : conversation));
    } else {
      setConversations(current => [{ id, title: text.replace(/\s+/g, " ").slice(0, 80), messages: [message] }, ...current]);
      setActiveId(id);
    }
    setDraft("");
    setAttachmentsOpen(false);
    input.current?.focus();
    void reply(id, conversationMessages);
  }

  function retry() {
    if (!active || request.current) return;
    followBottom();
    const completeMessages = active.messages.filter(message => message.complete);
    setConversations(current => current.map(conversation => conversation.id === active.id ? { ...conversation, messages: completeMessages } : conversation));
    void reply(active.id, completeMessages);
  }

  const historyProps = { conversations, activeId, onSelect: chooseConversation, onNew: () => chooseConversation(null) };

  return <div ref={root} className={styles.chat} data-collapsed={collapsed} data-no-translate dir="ltr">
    <aside className={styles.sidebar} aria-label="Chat sidebar">
      <div className={styles.sidebarTop}><button className={styles.iconControl} type="button" onClick={() => setCollapsed(value => !value)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed}>
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
      </button></div>
      <History {...historyProps} compact={collapsed} />
    </aside>

    <dialog ref={drawer} className={styles.drawer} aria-label="Chat sidebar" onClick={event => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX > bounds.right || event.clientX < bounds.left) event.currentTarget.close();
      }
    }}>
      <div className={styles.drawerInner}>
        <div className={styles.sidebarTop}><button className={styles.iconControl} type="button" aria-label="Close sidebar" title="Close sidebar" onClick={() => drawer.current?.close()}><X size={20} /></button></div>
        <History {...historyProps} />
      </div>
    </dialog>

    <main className={styles.main}>
      <div className={styles.topbar}>
        <button className={`${styles.iconControl} ${styles.mobileMenu}`} type="button" aria-label="Open sidebar" title="Open sidebar" onClick={() => drawer.current?.showModal()}><Menu size={22} /></button>
        <Link href="/" className={styles.iconControl} aria-label="Close" title="Close" onNavigate={event => {
          if (draft.trim() && !window.confirm("Discard your unsent message and return to the homepage?")) event.preventDefault();
        }}><X size={22} aria-hidden="true" /></Link>
      </div>

      <div className={styles.content}>
        <div className={styles.empty} data-hidden={hasMessages} aria-hidden={hasMessages} inert={hasMessages}>
          <BlueMindLogo className={styles.brandSymbol} solid priority />
          <h1>BlueMind AI</h1>
          <p>What can I help you create?</p>
        </div>
        <div ref={history} className={styles.messageScroll} data-active={hasMessages} tabIndex={hasMessages ? 0 : -1} aria-label="Chat messages">
          <div ref={messageList} className={styles.messages} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
            {messages.map(message => message.role === "assistant" ? <AssistantMessage key={message.id}
              text={message.text} complete={message.complete} animate={message.id === animatedId} pending={pending} />
              : <article key={message.id} className={styles.message} aria-label="Your message">
              <p dir="auto">{message.text}</p>
            </article>)}
            {pending && <p className={styles.replyStatus} role="status">BlueMind AI is responding...</p>}
            {active?.error && <div className={styles.replyError} role="alert"><p>{AI_ERRORS[active.error]}</p><button type="button" onClick={retry} disabled={pending}>Retry</button></div>}
          </div>
        </div>
      </div>

      <div className={styles.composerArea}>
        <div className={styles.suggestionReveal} data-hidden={hasMessages} aria-hidden={hasMessages} inert={hasMessages}>
          <div className={styles.suggestionClip}><div className={styles.suggestions}>
            {suggestions.map(suggestion => <button className={styles.chip} key={suggestion} type="button" onClick={() => { setDraft(suggestion); input.current?.focus(); }}>{suggestion}</button>)}
          </div></div>
        </div>
        <form className={styles.composer} onSubmit={event => { event.preventDefault(); send(); }}>
          <div className={styles.attachmentArea} ref={attachmentArea}>
            <button ref={attachmentTrigger} className={styles.iconControl} type="button" aria-label="Add attachment" title="Add attachment" aria-expanded={attachmentsOpen} aria-controls={menuId} onClick={() => setAttachmentsOpen(value => !value)}><Plus size={22} /></button>
            {attachmentsOpen && <div className={styles.attachmentMenu} id={menuId} role="group" aria-label="Attachments">
              <button type="button" disabled><ImageIcon size={18} />Add image</button>
              <button type="button" disabled><File size={18} />Add file</button>
              <p>Uploads are not available yet.</p>
            </div>}
          </div>
          <textarea ref={input} className={styles.input} rows={1} aria-label="Message" placeholder="Ask BlueMind anything…" value={draft}
            maxLength={AI_LIMITS.messageChars}
            onChange={event => setDraft(event.target.value)} onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); }
            }} />
          <button className={styles.primarySend} type="submit" disabled={!draft.trim() || pendingId !== null} aria-label="Send message" title="Send message"><ArrowUp size={21} aria-hidden="true" /></button>
        </form>
        <p className={styles.status} role="status">{available ? "Messages are sent to OpenAI. Avoid sharing sensitive information." : "AI responses are not connected"}</p>
      </div>
    </main>
  </div>;
}
