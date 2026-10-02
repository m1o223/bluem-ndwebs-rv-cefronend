"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "../portfolio/showcase.module.css";

export default function ConceptReveal({
  children,
  direction,
  stagger = false,
}: {
  children: ReactNode;
  direction: "right" | "left" | "up";
  stagger?: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const animation = useRef<Animation | null>(null);
  useEffect(() => {
    const node = element.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (played.current || reduced.matches || !window.IntersectionObserver)
      return;
    // Content is visible by default. Only animate once an observer confirms entry.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || played.current)
          return;
        played.current = true;
        node.dataset.revealPlayed = "true";
        observer.disconnect();
        if (
          reduced.matches ||
          !node.animate ||
          node.contains(document.activeElement)
        )
          return;
        const distance =
          direction === "up"
            ? 16
            : Number.parseFloat(
                getComputedStyle(node).getPropertyValue("--reveal-distance"),
              );
        const offset =
          direction === "up"
            ? `translateY(${distance}px)`
            : `translateX(${direction === "right" ? distance : -distance}px)`;
        animation.current = node.animate(
          [
            { opacity: 0, transform: offset },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: 540,
            delay: stagger ? 80 : 0,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "backwards",
          },
        );
      },
      { rootMargin: "0px 0px 24px 0px", threshold: 0 },
    );
    observer.observe(node);
    const reduceMotion = () => {
      if (reduced.matches) {
        animation.current?.finish();
        observer.disconnect();
      }
    };
    reduced.addEventListener("change", reduceMotion);
    return () => {
      observer.disconnect();
      animation.current?.cancel();
      reduced.removeEventListener("change", reduceMotion);
    };
  }, [direction, stagger]);
  return (
    <div
      ref={element}
      className={styles.reveal}
      data-reveal-direction={direction}
      onFocusCapture={() => animation.current?.finish()}
      onPointerDown={() => animation.current?.finish()}
    >
      {children}
    </div>
  );
}
