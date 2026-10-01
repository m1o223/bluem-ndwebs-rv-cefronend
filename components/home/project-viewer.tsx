"use client";

import { useEffect, useRef, useState } from "react";
import NorthSeaDemo from "./north-sea-demo";
import styles from "./home.module.css";

export default function InteractiveProjectViewer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!open || !dialog.current) return;
    const y = window.scrollY;
    const x = window.scrollX;
    const body = document.body;
    const saved = { position: body.style.position, top: body.style.top, left: body.style.left, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = `-${x}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    const element = dialog.current;
    element.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      element.close();
      Object.assign(body.style, saved);
      const previous = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(x, y);
      document.documentElement.style.scrollBehavior = previous;
    };
  }, [open]);

  function close() {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { onClose(); return; }
    setClosing(true);
    timer.current = setTimeout(() => { setClosing(false); onClose(); }, 180);
  }

  return <dialog ref={dialog} className={styles.projectDialog} data-closing={closing} aria-labelledby="project-viewer-title" onKeyDown={event => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex='0']")).filter(element => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last?.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus({ preventScroll: true });
    }
  }} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className={styles.viewerFrame}>
      <div className={styles.viewerToolbar}><div className={styles.viewerTitle}><span className={styles.browserDots} aria-hidden="true"><i /><i /><i /></span><span id="project-viewer-title">NORTH SEA <span className={styles.viewerBadge}>INTERACTIVE CONCEPT</span></span></div><button ref={closeButton} className={styles.closeButton} onClick={close}>Back to Projects <span aria-hidden="true">×</span></button></div>
      {open && <NorthSeaDemo />}
    </div>
  </dialog>;
}
