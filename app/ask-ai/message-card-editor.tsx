"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { X } from "lucide-react";
import type { MessageCardContent } from "../lib/ai/message-card";
import styles from "./message-card.module.css";

export default function MessageCardEditor({ value, maxBodyLength, onSave, onClose }: {
  value: MessageCardContent; maxBodyLength: number;
  onSave: (value: MessageCardContent) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const initial = useRef("");
  const initialBody = useRef("");
  const dirty = useRef(false);
  const [draft, setDraft] = useState(value);
  const [valid, setValid] = useState(true);

  function update(editor: Editor) {
    const doc = editor.getJSON();
    const first = editor.state.doc.firstChild;
    const body = { type: "doc", content: doc.content?.slice(1) ?? [] };
    // Keep untouched content byte-for-byte; serialize only edited body content.
    const next = {
      title: first?.textContent.trim() ?? "",
      body: JSON.stringify(body) === initialBody.current ? value.body : editor.markdown!.serialize(body).trim(),
    };
    dirty.current = JSON.stringify(doc) !== initial.current;
    setDraft(next);
    setValid(Boolean(first && ["heading", "paragraph"].includes(first.type.name)
      && next.title && next.title.length <= 200 && next.body.trim() && next.body.length <= maxBodyLength
      && body.content.some(node => node.type !== "paragraph" || node.content?.length)));
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ link: { openOnClick: false }, underline: false }), Markdown.configure({ markedOptions: { breaks: true } })],
    textDirection: "auto",
    editorProps: { attributes: { role: "textbox", "aria-label": "Message document", "aria-multiline": "true", class: styles.document } },
    onCreate: ({ editor }) => {
      const body = editor.markdown!.parse(value.body);
      editor.commands.setContent({ type: "doc", content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: value.title }] },
        ...(body.content ?? [{ type: "paragraph" }]),
      ] }, { emitUpdate: false });
      const doc = editor.getJSON();
      initial.current = JSON.stringify(doc);
      initialBody.current = JSON.stringify({ type: "doc", content: doc.content?.slice(1) ?? [] });
      editor.commands.focus("start");
    },
    onUpdate: ({ editor }) => update(editor),
  });

  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function beforeUnload(event: BeforeUnloadEvent) {
      if (dirty.current) { event.preventDefault(); event.returnValue = ""; }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  function requestClose() {
    if (!dirty.current || window.confirm("Discard unsaved changes?")) {
      dialog.current?.close();
      onClose();
    }
  }

  return createPortal(<dialog ref={dialog} className={styles.editorDialog} aria-label="Edit message" data-no-translate
    onKeyDownCapture={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); requestClose(); }
    }}
    onKeyDown={event => {
      if (event.key !== "Tab" || event.defaultPrevented) return;
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), [contenteditable="true"]');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}
    onCancel={event => { event.preventDefault(); requestClose(); }}>
    <div className={styles.editorLayout}>
      <header className={styles.editorHeader}>
        <span>Message</span>
        <div className={styles.editorActions}>
          <button type="button" className={styles.save} disabled={!editor || !valid}
            onClick={() => {
              if (valid) { dialog.current?.close(); onSave(dirty.current ? draft : value); }
            }}>Save changes</button>
          <button type="button" className={styles.close} aria-label="Close editor" title="Close"
            onClick={requestClose}><X size={20} aria-hidden="true" /></button>
        </div>
      </header>
      <div className={styles.editorScroll}><EditorContent editor={editor} /></div>
      {!valid && <p className={styles.validation} role="status">Include a title (up to 200 characters) and a message (up to {maxBodyLength.toLocaleString()} characters).</p>}
    </div>
  </dialog>, document.body);
}
