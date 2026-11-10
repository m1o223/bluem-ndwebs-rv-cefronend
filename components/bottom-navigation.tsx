"use client";

import Link from "next/link";
import { Bell, Home, LogIn, Menu as MenuIcon, Settings, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./bottom-navigation.module.css";

type NavigationItem = {
  href?: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  kind: "link" | "menu";
};

type BottomNavigationProps = {
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
};

const copy = {
  en: { home: "Home", ai: "BlueMind AI", signIn: "Sign in", menu: "Menu", messages: "Messages", account: "Account", navigation: "Primary navigation" },
  sv: { home: "Hem", ai: "BlueMind AI", signIn: "Logga in", menu: "Meny", messages: "Meddelanden", account: "Konto", navigation: "Huvudnavigering" },
  ar: { home: "الرئيسية", ai: "BlueMind AI", signIn: "تسجيل الدخول", menu: "القائمة", messages: "الرسائل", account: "الحساب", navigation: "التنقّل الرئيسي" },
} as const;

function getLocale() {
  if (typeof document === "undefined") return "en" as const;
  const locale = document.body.dataset.locale;
  return locale === "sv" || locale === "ar" ? locale : "en";
}

export default function BottomNavigation({ menuOpen = false, onMenuOpenChange }: BottomNavigationProps) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [locale, setLocale] = useState<keyof typeof copy>(getLocale());
  const itemsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        const response = await fetch("/api/customer/session", { credentials: "same-origin", cache: "no-store" });
        if (active) setAuthenticated(response.ok);
      } catch {
        if (active) setAuthenticated(false);
      }
    };
    void checkSession();
    const refresh = () => void checkSession();
    window.addEventListener("focus", refresh);
    window.addEventListener("customer-auth-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("customer-auth-changed", refresh);
    };
  }, [pathname]);

  useEffect(() => {
    const updateLocale = () => setLocale(getLocale());
    updateLocale();
    const observer = new MutationObserver(updateLocale);
    if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ["data-locale"] });
    return () => observer.disconnect();
  }, []);

  const hidden = pathname === "/sign-in" || pathname === "/login" || pathname === "/menu" || pathname === "/dashboard-preview";
  const items = useMemo<NavigationItem[]>(() => {
    const t = copy[locale];
    if (authenticated) {
      return [
        { href: "/dashboard", label: t.home, icon: Home, active: pathname === "/dashboard", kind: "link" },
        { href: "/blue-mind-ai", label: t.ai, icon: Sparkles, active: pathname === "/blue-mind-ai", kind: "link" },
        { href: "/notifications", label: t.messages, icon: Bell, active: pathname === "/notifications", kind: "link" },
        { href: "/account", label: t.account, icon: Settings, active: pathname === "/account", kind: "link" },
      ];
    }
    return [
      { href: "/", label: t.home, icon: Home, active: pathname === "/", kind: "link" },
      { href: "/ask-ai", label: t.ai, icon: Sparkles, active: pathname === "/ask-ai", kind: "link" },
      { href: "/sign-in", label: t.signIn, icon: LogIn, active: pathname === "/sign-in" || pathname === "/login", kind: "link" },
      { label: t.menu, icon: MenuIcon, active: menuOpen, kind: "menu" },
    ];
  }, [authenticated, locale, menuOpen, pathname]);

  useLayoutEffect(() => {
    const container = itemsRef.current;
    if (!container) return;
    const activeItem = container.querySelector<HTMLElement>('[data-active="true"]');
    if (!activeItem) { setIndicator(current => ({ ...current, ready: false })); return; }
    const sync = () => {
      const containerBounds = container.getBoundingClientRect();
      const bounds = activeItem.getBoundingClientRect();
      setIndicator({
        left: bounds.left - containerBounds.left,
        top: bounds.top - containerBounds.top,
        width: bounds.width,
        height: bounds.height,
        ready: true,
      });
    };
    sync();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    observer?.observe(container);
    observer?.observe(activeItem);
    window.addEventListener("resize", sync);
    return () => { observer?.disconnect(); window.removeEventListener("resize", sync); };
  }, [authenticated, items, pathname, locale, menuOpen]);

  useEffect(() => {
    document.body.dataset.bottomNavigation = hidden || authenticated === null ? "false" : "true";
    return () => { delete document.body.dataset.bottomNavigation; };
  }, [authenticated, hidden]);

  if (hidden || authenticated === null) return null;
  const t = copy[locale];
  return (
    <nav className={styles.navigation} aria-label={t.navigation} data-no-translate>
      <div ref={itemsRef} className={styles.items} data-count={items.length} data-ready={indicator.ready || undefined}>
        <span className={styles.activeIndicator} aria-hidden="true" style={{ left: indicator.left, top: indicator.top, width: indicator.width, height: indicator.height }} />
        {items.map(({ href, label, icon: Icon, active, kind }) => {
          const content = <><Icon className={styles.icon} size={19} strokeWidth={1.8} aria-hidden="true" /><span className={styles.label}>{label}</span></>;
          if (kind === "menu") {
            return <button key="menu" className={styles.item} type="button" data-active={active || undefined} aria-expanded={menuOpen} onClick={() => onMenuOpenChange?.(!menuOpen)}>{content}</button>;
          }
          return <Link key={href} href={href || "/"} className={styles.item} data-active={active || undefined} aria-current={active ? "page" : undefined}>{content}</Link>;
        })}
      </div>
    </nav>
  );
}
