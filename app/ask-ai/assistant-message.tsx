"use client";

import { memo, useLayoutEffect } from "react";
import Markdown, { type Components } from "react-markdown";
import { MessageActions, type Feedback } from "./message-actions";
import { MessageCard } from "./message-card";
import type { MessageCardContent } from "../lib/ai/message-card";
import { chatCopy } from "./chat-copy";
import { useLocalization } from "../../components/localization-provider";
import styles from "./chat-workspace.module.css";

const markdownComponents: Components = {
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  // Do not fetch remote images or tracking URLs from generated Markdown.
  img: ({ alt }) => <span>{alt}</span>,
  pre: ({ children }) => <pre tabIndex={0} aria-label="Code block">{children}</pre>,
};

function usePresentedText(text: string, _animate: boolean, _signal?: AbortSignal) {
  return { visible: text };
}

export const AssistantMessage = memo(function AssistantMessage({ id, text, card, complete, stopped, animate, pending, feedback, generating, signal, onPresented, onFeedback, onRegenerate, onSaveCard }: {
  id: string; text: string; complete: boolean; animate: boolean; pending: boolean;
  stopped?: boolean;
  signal?: AbortSignal; onPresented: (id: string, visible: string, finished: boolean) => void;
  card?: MessageCardContent; onSaveCard: (id: string, card: MessageCardContent) => void;
  feedback: Feedback; generating: boolean; onFeedback: (id: string, feedback: Feedback) => void; onRegenerate: (id: string) => void;
}) {
  const { locale } = useLocalization();
  const copy = chatCopy[locale];
  const { visible } = usePresentedText(text, animate && !stopped, signal);
  const revealing = visible.length < text.length;
  useLayoutEffect(() => {
    onPresented(id, visible, complete && !revealing);
  }, [id, visible, complete, revealing, onPresented]);
  return <article className={`${styles.message} ${styles.assistant}`} aria-label={copy.aiResponse} aria-busy={revealing || (!complete && pending)}>
    {visible && <div className={styles.markdown} dir="auto">
      <Markdown skipHtml components={markdownComponents}>{visible}</Markdown>
    </div>}
    {complete && card && !revealing && <MessageCard value={card} maxBodyLength={Math.min(11000, 12000 - text.length - 204)} onSave={value => onSaveCard(id, value)} />}
    {complete && !card && !revealing && <MessageActions text={text} feedback={feedback} generating={generating}
      onFeedback={value => onFeedback(id, value)} onRegenerate={() => onRegenerate(id)} />}
  </article>;
});
