"use client";

import { memo, useEffect, useRef, useState } from "react";
import Markdown, { type Components } from "react-markdown";
import { FastForward } from "lucide-react";
import styles from "./chat-workspace.module.css";

const markdownComponents: Components = {
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  // Do not fetch remote images or tracking URLs from generated Markdown.
  img: ({ alt }) => <span>{alt}</span>,
  pre: ({ children }) => <pre tabIndex={0} aria-label="Code block">{children}</pre>,
};

function usePresentedText(text: string, animate: boolean, instant: boolean) {
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
  return !animate || instant || reduced ? text : text.slice(0, count);
}

export const AssistantMessage = memo(function AssistantMessage({ text, complete, animate, pending }: {
  text: string; complete: boolean; animate: boolean; pending: boolean;
}) {
  const [instant, setInstant] = useState(false);
  const visible = usePresentedText(text, animate, instant);
  const revealing = visible.length < text.length;
  return <article className={`${styles.message} ${styles.assistant}`} aria-label="BlueMind AI response" aria-busy={revealing || (!complete && pending)}>
    <div className={styles.markdown} dir="auto">
      <Markdown skipHtml components={markdownComponents}>{visible}</Markdown>
    </div>
    {revealing && <button type="button" className={styles.revealResponse} onClick={() => setInstant(true)}
      title="Show all received text immediately and display incoming text without animation">
      <FastForward size={15} aria-hidden="true" />Show instantly
    </button>}
    {!complete && !pending && <small>Incomplete response</small>}
  </article>;
});
