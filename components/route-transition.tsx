"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./route-transition.module.css";
import revealStyles from "./reveal-scope.module.css";
import { useRevealScope } from "./reveal-scope";

export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const stage = useRef<HTMLDivElement>(null);

  useRevealScope(stage, pathname, pathname === "/ask-ai" || pathname === "/blue-mind-ai");

  return (
    <div ref={stage} className={`${styles.stage} ${revealStyles.stage}`} data-route={pathname}>
      {children}
    </div>
  );
}
