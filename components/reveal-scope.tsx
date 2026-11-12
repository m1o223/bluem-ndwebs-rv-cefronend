"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

const candidateSelector = [
  "[data-reveal-group]",
  "section[data-section]",
  "section[data-demo-section]",
  "section",
  "article",
  ".intro",
  ".sections",
  ".columns",
  ".cta",
  ".timeline",
  ".showcase",
  ".pricing",
  ".valueIntro",
  ".disclaimer",
].join(",");

function canReveal(element: HTMLElement) {
  return !element.matches("[data-reveal-skip]") && !element.closest("[data-reveal-exclude]");
}

function collectCandidates(root: HTMLElement) {
  const marked = Array.from(root.querySelectorAll<HTMLElement>(candidateSelector)).filter(canReveal);
  const chosen: HTMLElement[] = [];

  for (const element of marked) {
    const explicit = element.matches("[data-reveal-group], section[data-section], section[data-demo-section]");
    if (explicit) {
      chosen.push(element);
      continue;
    }

    const parentCandidate = element.parentElement?.closest(candidateSelector) as HTMLElement | null;
    if (!parentCandidate || parentCandidate === element || !canReveal(parentCandidate)) chosen.push(element);
  }

  return Array.from(new Set(chosen));
}

function clearScope(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-reveal-state]").forEach((element) => {
    element.removeAttribute("data-reveal-state");
  });
  root.removeAttribute("data-reveal-ready");
}

export function useRevealScope(ref: RefObject<HTMLElement | null>, key: string, disabled = false) {
  const previousKey = useRef(key);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (previousKey.current !== key) {
      clearScope(root);
      previousKey.current = key;
    }

    if (disabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearScope(root);
      return;
    }

    let frame = 0;
    let observer: IntersectionObserver | null = null;
    const reveal = new Set<HTMLElement>();

    const scan = () => {
      const candidates = collectCandidates(root);
      for (const element of candidates) {
        if (reveal.has(element)) continue;
        reveal.add(element);
        element.dataset.revealState = "pending";
        observer?.observe(element);
      }
    };

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        element.dataset.revealState = "visible";
        observer?.unobserve(element);
      }
    }, { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.01 });

    root.dataset.revealReady = "true";
    scan();

    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mutations.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-reveal-group", "data-hidden", "data-visible"],
    });

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer?.disconnect();
      root.removeAttribute("data-reveal-ready");
    };
  }, [disabled, key, ref]);
}
