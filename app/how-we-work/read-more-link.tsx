"use client";

import type { MouseEvent, ReactNode } from "react";

export default function ReadMoreLink({ className, children }: { className?: string; children: ReactNode }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById("work-steps");
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", "#work-steps");
  }

  return <a href="#work-steps" className={className} onClick={handleClick}>{children}</a>;
}
