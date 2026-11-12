"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./route-transition.module.css";
import revealStyles from "./reveal-scope.module.css";
import { useRevealScope } from "./reveal-scope";

export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const stage = useRef<HTMLDivElement>(null);
  const transition = useRef<Animation | null>(null);
  const pendingDirection = useRef<"forward" | "backward" | null>(null);
  const [navigationSignal, setNavigationSignal] = useState(0);

  useRevealScope(stage, pathname, pathname === "/ask-ai" || pathname === "/blue-mind-ai");

  useLayoutEffect(() => {
    const pathChanged = previousPath.current !== pathname;
    const signalChanged = navigationSignal > 0;
    const restoredFrom = !pathChanged && !signalChanged ? sessionStorage.getItem("bluemind-current-route") : null;
    if (!pathChanged && !signalChanged && !restoredFrom) return;
    const from = restoredFrom || previousPath.current;
    previousPath.current = pathname;
    if (restoredFrom) sessionStorage.removeItem("bluemind-current-route");

    const root = stage.current;
    if (!root || pathname === "/ask-ai" || pathname === "/blue-mind-ai" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const routeOrder = ["/", "/about", "/services", "/templates", "/how-we-work", "/care", "/our-work", "/contact", "/quote", "/faq", "/ask-ai", "/dashboard", "/my-project", "/blue-mind-ai", "/notifications", "/account"];
    const indexOf = (value: string) => { const index = routeOrder.indexOf(value); return index === -1 ? routeOrder.length : index; };
    const direction = pendingDirection.current || (indexOf(pathname) >= indexOf(from) ? "forward" : "backward");
    pendingDirection.current = null;
    const shift = direction === "forward" ? 12 : -12;
    const x = document.documentElement.dir === "rtl" ? -shift : shift;
    const surface = root.querySelector<HTMLElement>("[data-page-transition-surface]") || root;

    transition.current?.cancel();
    root.dataset.routeTransition = "true";
    root.dataset.routeTransitionDirection = direction;
    const animation = surface.animate(
      [
        { opacity: 0.72, transform: `translateX(${x}px)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 320, easing: "cubic-bezier(.22, .8, .28, 1)", fill: "both" },
    );
    transition.current = animation;
    const cleanup = () => {
      if (transition.current === animation) transition.current = null;
      delete root.dataset.routeTransition;
    };
    animation.addEventListener("finish", cleanup, { once: true });
    animation.addEventListener("cancel", cleanup, { once: true });
    return () => {
      animation.cancel();
      cleanup();
    };
  }, [navigationSignal, pathname]);

  useEffect(() => {
    sessionStorage.setItem("bluemind-current-route", pathname);
  }, [pathname]);

  useEffect(() => {
    const routeOrder = ["/", "/about", "/services", "/templates", "/how-we-work", "/care", "/our-work", "/contact", "/quote", "/faq", "/ask-ai", "/dashboard", "/my-project", "/blue-mind-ai", "/notifications", "/account"];
    const indexOf = (value: string) => { const index = routeOrder.indexOf(value); return index === -1 ? routeOrder.length : index; };
    const signalNavigation = (targetPath: string) => {
      pendingDirection.current = indexOf(targetPath) >= indexOf(pathname) ? "forward" : "backward";
      setNavigationSignal(value => value + 1);
    };
    const onPopState = () => signalNavigation(window.location.pathname);
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const previous = sessionStorage.getItem("bluemind-current-route") || pathname;
      signalNavigation(pathname);
      pendingDirection.current = indexOf(pathname) >= indexOf(previous) ? "forward" : "backward";
    };
    const onPageHide = () => sessionStorage.setItem("bluemind-current-route", pathname);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [pathname]);

  return (
    <div ref={stage} className={`${styles.stage} ${revealStyles.stage}`} data-route={pathname}>
      {children}
    </div>
  );
}
