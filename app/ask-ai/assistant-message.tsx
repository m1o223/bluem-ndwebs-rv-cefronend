"use client";

import { memo, useEffect, useRef, useState } from "react";
import Markdown, { type Components } from "react-markdown";
import { FastForward } from "lucide-react";
import { MessageActions, type Feedback } from "./message-actions";
import { MessageCard } from "./message-card";
import type { MessageCardContent } from "../lib/ai/message-card";
import styles from "./chat-workspace.module.css";

const markdownComponents: Components = {
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  // Do not fetch remote images or tracking URLs from generated Markdown.
  img: ({ alt }) => <span>{alt}</span>,
  pre: ({ children }) => <pre tabIndex={0} aria-label="Code block">{children}</pre>,
};

function usePresentedText(text: string, animate: boolean) {
  const [instant, setInstant] = useState(false);
  const instantRef = useRef(false);
  const [count, setCount] = useState(animate ? 0 : text.length);
  const [reduced, setReduced] = useState(false);
  const progress = useRef(count);
  const target = useRef(text);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    target.current = text;
    if (!animate || instant || reduced) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      progress.current = text.length;
      setCount(text.length);
      return;
    }
    // Consume the presentation buffer independently of the network reader.
    // Adapt to large bursts so long replies don't take minutes to reveal.
    function tick() {
      if (instantRef.current) { timer.current = null; return; }
      const value = target.current;
      const remaining = value.length - progress.current;
      let next = Math.min(value.length, progress.current + Math.max(4, Math.ceil(remaining / 45)));
      if (next < value.length && /[\uDC00-\uDFFF]/.test(value[next])) next++;
      progress.current = next;
      setCount(next);
      timer.current = next < value.length ? setTimeout(tick, 40) : null;
    }
    if (!timer.current && progress.current < text.length) timer.current = setTimeout(tick, 40);
  }, [text, animate, instant, reduced]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  function showInstantly() {
    // This affects presentation only. The network reader continues independently.
    instantRef.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setInstant(true);
  }
  return { visible: !animate || instant || reduced ? text : text.slice(0, count), instant, showInstantly };
}

export const AssistantMessage = memo(function AssistantMessage({ id, text, card, complete, stopped, animate, pending, feedback, generating, onFeedback, onRegenerate, onSaveCard }: {
  id: string; text: string; complete: boolean; animate: boolean; pending: boolean;
  stopped?: boolean;
  card?: MessageCardContent; onSaveCard: (id: string, card: MessageCardContent) => void;
  feedback: Feedback; generating: boolean; onFeedback: (id: string, feedback: Feedback) => void; onRegenerate: (id: string) => void;
}) {
  const { visible, instant, showInstantly } = usePresentedText(text, animate && !stopped);
  const revealing = visible.length < text.length;
  return <article className={`${styles.message} ${styles.assistant}`} aria-label="BlueMind AI response" aria-busy={revealing || (!complete && pending)}>
    {visible && <div className={styles.markdown} dir="auto">
      <Markdown skipHtml components={markdownComponents}>{visible}</Markdown>
    </div>}
    {complete && card && !revealing && <MessageCard value={card} maxBodyLength={Math.min(11000, 12000 - text.length - 204)} onSave={value => onSaveCard(id, value)} />}
    {revealing && <button type="button" className={styles.revealResponse} onClick={showInstantly}
      title="Show all received text immediately and display incoming text without animation">
      <FastForward size={15} aria-hidden="true" />Show instantly
    </button>}
    {instant && pending && !complete && <small aria-live="polite">Showing new text as it arrives...</small>}
    {!complete && !pending && <small>{stopped ? "Response stopped" : "Incomplete response"}</small>}
    {complete && !card && !revealing && <MessageActions text={text} feedback={feedback} generating={generating}
      onFeedback={value => onFeedback(id, value)} onRegenerate={() => onRegenerate(id)} />}
  </article>;
});
