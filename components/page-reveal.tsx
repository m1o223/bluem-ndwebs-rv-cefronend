"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

type PageRevealProps = {
  rootId: string;
};

export default function PageReveal({ rootId }: PageRevealProps) {
  const frameRef = useRef<number | null>(null);

  const restart = useCallback(() => {
    const root = document.getElementById(rootId);
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root?.removeAttribute("data-page-reveal");
      return;
    }

    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    root.dataset.pageReveal = "restarting";
    frameRef.current = window.requestAnimationFrame(() => {
      if (root.isConnected) root.dataset.pageReveal = "ready";
      frameRef.current = null;
    });
  }, [rootId]);

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
