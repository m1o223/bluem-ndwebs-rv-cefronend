"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const storagePrefix = "bluemind-scroll:";

export default function RouteScrollState() {
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  const scrollY = useRef(0);

  useEffect(() => {
    const remember = () => { scrollY.current = window.scrollY; };
    remember();
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, []);

  useEffect(() => {
    const previous = currentPath.current;
    if (previous !== pathname) {
      try { sessionStorage.setItem(`${storagePrefix}${previous}`, String(scrollY.current)); } catch {}
    }
    currentPath.current = pathname;

    let saved = 0;
    try { saved = Number(sessionStorage.getItem(`${storagePrefix}${pathname}`) || 0); } catch {}
    const restore = () => window.scrollTo({ top: Number.isFinite(saved) ? saved : 0, left: 0, behavior: "auto" });
    const first = window.requestAnimationFrame(() => window.requestAnimationFrame(restore));
    const fallback = window.setTimeout(restore, 80);
    return () => { window.cancelAnimationFrame(first); window.clearTimeout(fallback); };
  }, [pathname]);

  useEffect(() => {
    const save = () => {
      try { sessionStorage.setItem(`${storagePrefix}${currentPath.current}`, String(window.scrollY)); } catch {}
    };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);

  return null;
}
