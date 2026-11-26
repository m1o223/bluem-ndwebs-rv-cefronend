"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const rootId = "contact-reveal-root";

export default function ContactReveal() {
  const frameRef = useRef<number | null>(null);

  const restart = useCallback(() => {
    const root = document.getElementById(rootId);
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root?.removeAttribute("data-contact-reveal");
      return;
    }

    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    root.dataset.contactReveal = "restarting";
    frameRef.current = window.requestAnimationFrame(() => {
      if (root.isConnected) root.dataset.contactReveal = "ready";
      frameRef.current = null;
    });
  }, []);

  useLayoutEffect(() => {
    restart();
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [restart]);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) restart();
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [restart]);

  return null;
}
