"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useChatScroll(conversationId: string | null) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const follow = useRef<() => void>(() => {});
  const followBottom = useCallback(() => follow.current(), []);

  useEffect(() => {
    const element = viewport.current;
    const list = content.current;
    if (!element || !list) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let pinned = true;
    let frame = 0;
    let previous = element.scrollTop;
    let written = -1;
    let touchY = 0;
    let lastTime = 0;
    let scrollbarDrag = false;
    const stop = () => { pinned = false; cancelAnimationFrame(frame); frame = 0; };
    const tick = (now: number) => {
      frame = 0;
      if (!pinned) return;
      const bottom = Math.max(0, element.scrollHeight - element.clientHeight);
      const distance = bottom - element.scrollTop;
      const elapsed = Math.min(64, now - lastTime || 16);
      lastTime = now;
      element.scrollTop = motion.matches || Math.abs(distance) <= 3 ? bottom
        : element.scrollTop + distance * (1 - Math.exp(-elapsed / 65));
      written = element.scrollTop;
      previous = written;
      if (Math.abs(bottom - written) >= 2) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (pinned && !frame) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
    };
    follow.current = () => { pinned = true; schedule(); };
    const wheel = (event: WheelEvent) => { if (event.deltaY < 0) stop(); };
    const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
    const touchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchY;
      if (y > touchY + 2) stop();
      touchY = y;
    };
    const key = (event: KeyboardEvent) => {
      if (["ArrowUp", "PageUp", "Home"].includes(event.key) || (event.key === " " && event.shiftKey)) stop();
    };
    const pointerDown = (event: PointerEvent) => { scrollbarDrag = event.target === element; };
    const pointerUp = () => { scrollbarDrag = false; };
    const scroll = () => {
      const top = element.scrollTop;
      if (Math.abs(top - written) < 1) { previous = top; return; }
      // Focus and Markdown reflow can also move scrollTop; only user intent pauses follow.
      if (scrollbarDrag && top < previous - 1) stop();
      else if (top > previous && element.scrollHeight - element.clientHeight - top < 24) {
        pinned = true;
        schedule();
      }
      previous = top;
    };
    // Observe rendered Markdown height, not incoming network chunks.
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    observer.observe(element);
    element.addEventListener("wheel", wheel, { passive: true });
    element.addEventListener("touchstart", touchStart, { passive: true });
    element.addEventListener("touchmove", touchMove, { passive: true });
    element.addEventListener("keydown", key);
    element.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointerup", pointerUp);
    element.addEventListener("scroll", scroll, { passive: true });
    schedule();
    return () => {
      stop();
      observer.disconnect();
      follow.current = () => {};
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("touchstart", touchStart);
      element.removeEventListener("touchmove", touchMove);
      element.removeEventListener("keydown", key);
      element.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      element.removeEventListener("scroll", scroll);
    };
  }, []);

  useLayoutEffect(() => { followBottom(); }, [conversationId, followBottom]);
  return { viewport, content, followBottom };
}
