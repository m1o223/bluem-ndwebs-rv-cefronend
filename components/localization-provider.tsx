"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "sv" | "ar";

type Language = {
  code: Locale;
  short: "EN" | "SV" | "AR";
  label: string;
  nativeName: string;
};

type LocalizationContextValue = {
  locale: Locale;
  languages: Language[];
  setLocale: (locale: Locale) => void;
  translate: (value: string) => string;
};

type MessageMap = Record<string, string>;

const storageKey = "bluemind-language";
const languages: Language[] = [
  { code: "en", short: "EN", label: "English", nativeName: "English" },
  { code: "sv", short: "SV", label: "Svenska", nativeName: "Svenska" },
  { code: "ar", short: "AR", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
];
const messages: Record<Locale, MessageMap> = {
  en: {},
  sv: {},
  ar: {},
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);
const textOriginals = new WeakMap<Text, string>();
const textTranslations = new WeakMap<Text, string>();
const originalAttributePrefix = "data-i18n-original-";

function normalizeLocale(value: string | null): Locale {
  return value === "sv" || value === "ar" ? value : "en";
}

function preferredBrowserLocale() {
  if (typeof navigator === "undefined") return "en" as Locale;
  const candidates = [...(navigator.languages ?? []), navigator.language];
  const match = candidates.find((value) => /^(ar|sv)(-|$)/i.test(value));
  return normalizeLocale(match?.slice(0, 2).toLowerCase() ?? "en");
}

function splitOuterWhitespace(value: string) {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return {
    leading: match?.[1] ?? "",
    core: match?.[2] ?? value,
    trailing: match?.[3] ?? "",
  };
}

function shouldSkipNode(node: Node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  return Boolean(element?.closest("script, style, code, pre, [data-no-translate]"));
}

function translateValue(value: string, locale: Locale) {
  if (locale === "en") return value;
  const { leading, core, trailing } = splitOuterWhitespace(value);
  const translated = messages[locale][core] ?? translateDynamicValue(core, locale);
  return `${leading}${translated}${trailing}`;
}

function translateDynamicValue(value: string, locale: Locale) {
  if (locale === "sv") {
    if (value === "FAQ") return "Vanliga frågor";
    if (/^\d[\d\s,.]* SEK$/.test(value)) return value.replace(/,/g, " ");
    if (value.startsWith("Pay the remaining ") && value.endsWith(" according to the agreed delivery terms.")) {
      return `Betala resterande ${value.slice(18, -" according to the agreed delivery terms.".length)} enligt \u00f6verenskomna leveransvillkor.`;
    }
    if (value.startsWith("Pay the remaining ")) return `Betala resterande ${value.slice(18)}`;
    if (value.startsWith("Remaining balance: ")) return `\u00c5terst\u00e5ende belopp: ${value.slice(19)}`;
    if (value.startsWith("Pay ") && value.endsWith(" now")) return `Betala ${value.slice(4, -4)} nu`;
    if (value.startsWith("Pay ")) return `Betala ${value.slice(4)}`;
    if (value.startsWith("Choose ")) return `V\u00e4lj ${value.slice(7)}`;
    if (value.includes(" SEK / month")) return value.replace(" SEK / month", " SEK / m\u00e5nad");
    if (value.includes(" SEK / year")) return value.replace(" SEK / year", " SEK / \u00e5r");
    if (value.startsWith("Restore ")) return `\u00c5terst\u00e4ll ${value.slice(8)}`;
    if (value.startsWith("View Website: ")) return value.replace("View Website: ", "Visa webbplats: ");
    if (value.startsWith("Close ")) return `St\u00e4ng ${value.slice(6)}`;
    if (value.startsWith("Open ")) return `\u00d6ppna ${value.slice(5)}`;
    if (value.endsWith("All rights reserved.")) return value.replace("All rights reserved.", "Alla r\u00e4ttigheter f\u00f6rbeh\u00e5llna.");
  }
  if (locale === "ar") {
    if (value === "FAQ") return "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629";
    if (/^\d[\d\s,.]* SEK$/.test(value)) return value.replace("SEK", "\u0643\u0631\u0648\u0646\u0629 \u0633\u0648\u064a\u062f\u064a\u0629");
    if (value.startsWith("Pay the remaining ") && value.endsWith(" according to the agreed delivery terms.")) {
      return `\u0627\u062f\u0641\u0639 \u0627\u0644\u0645\u062a\u0628\u0642\u064a ${value.slice(18, -" according to the agreed delivery terms.".length)} \u0648\u0641\u0642\u0627 \u0644\u0634\u0631\u0648\u0637 \u0627\u0644\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0645\u062a\u0641\u0642 \u0639\u0644\u064a\u0647\u0627.`;
    }
    if (value.startsWith("Pay the remaining ")) return `\u0627\u062f\u0641\u0639 \u0627\u0644\u0645\u062a\u0628\u0642\u064a ${value.slice(18)}`;
    if (value.startsWith("Remaining balance: ")) return `\u0627\u0644\u0631\u0635\u064a\u062f \u0627\u0644\u0645\u062a\u0628\u0642\u064a: ${value.slice(19)}`;
    if (value.startsWith("Pay ") && value.endsWith(" now")) return `\u0627\u062f\u0641\u0639 ${value.slice(4, -4)} \u0627\u0644\u0622\u0646`;
    if (value.startsWith("Pay ")) return `\u0627\u062f\u0641\u0639 ${value.slice(4)}`;
    if (value.startsWith("Choose ")) return `\u0627\u062e\u062a\u0631 ${value.slice(7)}`;
    if (value.includes(" SEK / month")) return value.replace(" SEK / month", " SEK / \u0634\u0647\u0631");
    if (value.includes(" SEK / year")) return value.replace(" SEK / year", " SEK / \u0633\u0646\u0629");
    if (value.startsWith("Restore ")) return `\u0627\u0633\u062a\u0639\u0627\u062f\u0629 ${value.slice(8)}`;
    if (value.startsWith("View Website: ")) return value.replace("View Website: ", "\u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0642\u0639: ");
    if (value.startsWith("Close ")) return `\u0625\u063a\u0644\u0627\u0642 ${value.slice(6)}`;
    if (value.startsWith("Open ")) return `\u0641\u062a\u062d ${value.slice(5)}`;
  }
  if (locale === "ar" && value.endsWith("All rights reserved.")) return value.replace("All rights reserved.", "\u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.");
  return value;
}

function translateTextNode(node: Text, locale: Locale) {
  if (shouldSkipNode(node)) return;
  const current = node.nodeValue ?? "";
  if (!current.trim()) return;
  const storedOriginal = textOriginals.get(node);
  const previousTranslation = textTranslations.get(node);
  // React may replace a text node's source when a component renders a locale-specific copy.
  // Only reuse the stored English source when the current value is still our last translation.
  const original = storedOriginal && current === previousTranslation ? storedOriginal : current;
  textOriginals.set(node, original);
  const translated = translateValue(original, locale);
  textTranslations.set(node, translated);
  if (node.nodeValue !== translated) node.nodeValue = translated;
}

function translateAttributes(root: ParentNode, locale: Locale) {
  const attributeNames = ["placeholder", "aria-label", "title"];
  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    if (element.closest("[data-no-translate], script, style, code, pre")) return;
    attributeNames.forEach((name) => {
      const current = element.getAttribute(name);
      if (!current?.trim()) return;
      const originalAttribute = `${originalAttributePrefix}${name.replace(/[^a-z0-9-]/gi, "-")}`;
      const storedOriginal = element.getAttribute(originalAttribute);
      if (locale === "en") {
        if (storedOriginal) element.setAttribute(name, storedOriginal);
        else element.setAttribute(originalAttribute, current);
        return;
      }
      const previousTranslated = storedOriginal ? translateValue(storedOriginal, locale) : null;
      const original = storedOriginal && current === previousTranslated ? storedOriginal : current;
      element.setAttribute(originalAttribute, original);
      const translated = translateValue(original, locale);
      if (current !== translated) element.setAttribute(name, translated);
    });
  });
}

function translateDocument(locale: Locale) {
  if (!document.body) return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  document.body.dataset.locale = locale;
  document.body.dataset.direction = locale === "ar" ? "rtl" : "ltr";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    translateTextNode(node as Text, locale);
    node = walker.nextNode();
  }
  translateAttributes(document.body, locale);
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [loadedLocale, setLoadedLocale] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      setLocaleState(stored ? normalizeLocale(stored) : preferredBrowserLocale());
    } catch {
      setLocaleState(preferredBrowserLocale());
    }
  }, []);

  useEffect(() => {
    const syncStoredLocale = (event: StorageEvent) => {
      if (event.key !== storageKey || event.newValue === null) return;
      setLocaleState(normalizeLocale(event.newValue));
    };
    window.addEventListener("storage", syncStoredLocale);
    return () => window.removeEventListener("storage", syncStoredLocale);
  }, []);

  useEffect(() => {
    let active = true;
    if (locale === "en") {
      setLoadedLocale("en");
      return () => { active = false; };
    }
    const loader = locale === "sv" ? import("../messages/sv.json") : import("../messages/ar.json");
    loader.then((module) => {
      messages[locale] = module.default as MessageMap;
      if (active) setLoadedLocale(locale);
    }).catch(() => {
      if (active) setLoadedLocale("en");
    });
    return () => { active = false; };
  }, [locale]);

  const value = useMemo<LocalizationContextValue>(() => ({
    locale,
    languages,
    setLocale: (nextLocale) => {
      try {
        window.localStorage.setItem(storageKey, nextLocale);
        document.cookie = `${storageKey}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        // Browsers can block storage in private or restricted contexts.
      }
      setLocaleState(nextLocale);
    },
    translate: (text) => translateValue(text, locale),
  }), [locale, loadedLocale]);

  useEffect(() => {
    let frame = 0;
    const scheduleTranslation = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => translateDocument(locale));
    };
    translateDocument(locale);
    const observer = new MutationObserver(scheduleTranslation);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title"],
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [locale, loadedLocale]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error("useLocalization must be used inside LocalizationProvider");
  return context;
}
