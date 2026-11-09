"use client";

import Link from "next/link";
import { Bell, Home, LogIn, Settings, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styles from "./bottom-navigation.module.css";

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
};

const copy = {
  en: { home: "Home", ai: "BlueMind AI", signIn: "Sign in", menu: "Menu", project: "My Project", messages: "Messages", account: "Account", navigation: "Primary navigation" },
  sv: { home: "Hem", ai: "BlueMind AI", signIn: "Logga in", menu: "Meny", project: "Mitt projekt", messages: "Meddelanden", account: "Konto", navigation: "Huvudnavigering" },
  ar: { home: "الرئيسية", ai: "BlueMind AI", signIn: "تسجيل الدخول", menu: "القائمة", project: "مشروعي", messages: "الرسائل", account: "الحساب", navigation: "التنقّل الرئيسي" },
} as const;

function getLocale() {
  if (typeof document === "undefined") return "en" as const;
  const locale = document.body.dataset.locale;
  return locale === "sv" || locale === "ar" ? locale : "en";
}

export default function BottomNavigation() {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [locale, setLocale] = useState<keyof typeof copy>(getLocale());

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

  const hidden = pathname === "/ask-ai" || pathname === "/sign-in" || pathname === "/login" || pathname === "/menu" || pathname === "/dashboard-preview";
  const items = useMemo<NavigationItem[]>(() => {
    const t = copy[locale];
    if (authenticated) {
      return [
        { href: "/dashboard", label: t.home, icon: Home, active: pathname === "/dashboard" },
        { href: "/blue-mind-ai", label: t.ai, icon: Sparkles, active: pathname === "/blue-mind-ai" },
        { href: "/notifications", label: t.messages, icon: Bell, active: pathname === "/notifications" },
        { href: "/account", label: t.account.split(" /")[0], icon: Settings, active: pathname === "/account" },
      ];
    }
    return [
      { href: "/", label: t.home, icon: Home, active: pathname === "/" },
      { href: "/ask-ai", label: t.ai, icon: Sparkles, active: pathname === "/ask-ai" },
      { href: "/sign-in", label: t.signIn, icon: LogIn, active: pathname === "/sign-in" || pathname === "/login" },
    ];
  }, [authenticated, locale, pathname]);

  useEffect(() => {
    document.body.dataset.bottomNavigation = hidden || authenticated === null ? "false" : "true";
    return () => { delete document.body.dataset.bottomNavigation; };
  }, [authenticated, hidden]);

  if (hidden || authenticated === null) return null;
  const t = copy[locale];
  return (
    <nav className={styles.navigation} aria-label={t.navigation} data-no-translate>
      <div className={styles.items} data-count={items.length}>
        {items.map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href} className={styles.item} data-active={active || undefined} aria-current={active ? "page" : undefined}>
            <Icon className={styles.icon} size={19} strokeWidth={1.8} aria-hidden="true" />
            <span className={styles.label}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
