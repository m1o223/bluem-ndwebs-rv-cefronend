"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./route-transition.module.css";

const routeOrder = [
  "/",
  "/about",
  "/services",
  "/templates",
  "/how-we-work",
  "/care",
  "/our-work",
  "/contact",
  "/quote",
  "/faq",
  "/ask-ai",
  "/dashboard",
  "/my-project",
  "/blue-mind-ai",
  "/notifications",
  "/account",
];

function routeIndex(pathname: string) {
  const index = routeOrder.indexOf(pathname);
  return index === -1 ? routeOrder.length : index;
}

export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [direction, setDirection] = useState<"forward" | "backward" | null>(null);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    const from = previousPath.current;
    const nextDirection = routeIndex(pathname) >= routeIndex(from) ? "forward" : "backward";
    previousPath.current = pathname;
    setDirection(nextDirection);
    const timer = window.setTimeout(() => setDirection(null), 360);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={styles.stage} data-direction={direction || undefined} data-route={pathname}>
      {children}
    </div>
  );
}
