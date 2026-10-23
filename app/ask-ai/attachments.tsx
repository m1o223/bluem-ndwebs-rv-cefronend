"use client";

import { memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FileText, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { attachmentUrl, type LocalAttachment } from "../lib/ai/attachments";
import styles from "./attachments.module.css";

export const AttachmentList = memo(function AttachmentList({ files, onRemove, onOpen }: {
  files: LocalAttachment[]; onRemove?: (id: string) => void; onOpen?: (file: LocalAttachment) => void;
}) {
  return <div className={styles.list} data-draft={Boolean(onRemove)} aria-label={onRemove ? "Selected attachments" : "Message attachments"}>
    {files.map(file => <div key={file.id} className={styles.item} data-image={file.type.startsWith("image/")}>
      {file.type.startsWith("image/") ? <button className={styles.imageButton} type="button" onClick={() => onOpen?.(file)} aria-label={`Open image ${file.name}`}>
        {/* Private in-memory previews must not pass through an image optimization service. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={attachmentUrl(file)} width={file.width} height={file.height} alt={file.name} draggable={false} />
      </button> : <div className={styles.file}><FileText size={22} aria-hidden="true" /><div><strong dir="auto">{file.name}</strong><small>{file.name.split(".").at(-1)?.toUpperCase()} · {Math.ceil(file.size / 1024)} KB</small>
        {file.name.toLowerCase().endsWith(".docx") && <small>Text only</small>}
        {file.name.toLowerCase().endsWith(".xlsx") && <small>Cell values only</small>}</div></div>}
      {onRemove && <button className={styles.remove} type="button" onClick={() => onRemove(file.id)} aria-label={`Remove ${file.name}`} title={`Remove ${file.name}`}><X size={16} /></button>}
    </div>)}
  </div>;
});

export function ImageViewer({ file, onClose }: { file: LocalAttachment; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal(); close.current?.focus();
    return () => { element?.close(); previous?.focus({ preventScroll: true }); };
  }, []);
  return createPortal(<dialog ref={dialog} className={styles.viewer} aria-label={`Image viewer: ${file.name}`} onCancel={event => { event.preventDefault(); onClose(); }} data-no-translate>
    <TransformWrapper minScale={1} maxScale={5} centerOnInit wheel={{ step: .12 }} doubleClick={{ mode: "toggle" }}>
      {({ zoomIn, zoomOut, resetTransform }) => <>
        <div className={styles.toolbar}><span dir="auto">{file.name}</span>
          <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => zoomOut(.3, 0)}><ZoomOut size={22} /></button>
          <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => zoomIn(.3, 0)}><ZoomIn size={22} /></button>
          <button type="button" aria-label="Reset zoom" title="Reset zoom" onClick={() => resetTransform(0)}><RotateCcw size={22} /></button>
          <button ref={close} type="button" aria-label="Close image" title="Close image" onClick={onClose}><X size={24} /></button>
        </div>
        <TransformComponent wrapperClass={styles.viewArea} contentClass={styles.viewContent}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.fullImage} src={attachmentUrl(file)} alt={file.name} draggable={false} />
        </TransformComponent>
      </>}
    </TransformWrapper>
  </dialog>, document.body);
}
