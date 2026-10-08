"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import arMessages from "../messages/ar.json";
import svMessages from "../messages/sv.json";

export type Locale = "en" | "sv" | "ar";

type Language = {
  code: Locale;
  short: "EN" | "SV" | "AR";
  label: string;
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
  { code: "en", short: "EN", label: "English" },
  { code: "sv", short: "SV", label: "Svenska" },
  { code: "ar", short: "AR", label: "العربية" },
];
const messages: Record<Locale, MessageMap> = {
  en: {},
  sv: svMessages as MessageMap,
  ar: arMessages as MessageMap,
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);
const textOriginals = new WeakMap<Text, string>();
const originalAttributePrefix = "data-i18n-original-";

function normalizeLocale(value: string | null): Locale {
  return value === "sv" || value === "ar" ? value : "en";
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
    if (value.startsWith("Pay ") && value.endsWith(" now")) return `Betala ${value.slice(4, -4)} nu`;
    if (value.startsWith("Pay ")) return `Betala ${value.slice(4)}`;
    if (value.startsWith("Choose ")) return `Välj ${value.slice(7)}`;
    if (value.includes(" SEK / month")) return value.replace(" SEK / month", " SEK / månad");
    if (value.includes(" SEK / year")) return value.replace(" SEK / year", " SEK / år");
    if (value.startsWith("Restore ")) return `Återställ ${value.slice(8)}`;
    if (value.startsWith("View Website: ")) return value.replace("View Website: ", "Visa webbplats: ");
    if (value.startsWith("Close ")) return `Stäng ${value.slice(6)}`;
    if (value.startsWith("Open ")) return `Öppna ${value.slice(5)}`;
  }
  if (locale === "ar") {
    if (value.startsWith("Pay ") && value.endsWith(" now")) return `ادفع ${value.slice(4, -4)} الآن`;
    if (value.startsWith("Pay ")) return `ادفع ${value.slice(4)}`;
    if (value.startsWith("Choose ")) return `اختر ${value.slice(7)}`;
    if (value.includes(" SEK / month")) return value.replace(" SEK / month", " SEK / شهر");
    if (value.includes(" SEK / year")) return value.replace(" SEK / year", " SEK / سنة");
    if (value.startsWith("Restore ")) return `استعادة ${value.slice(8)}`;
    if (value.startsWith("View Website: ")) return value.replace("View Website: ", "عرض الموقع: ");
    if (value.startsWith("Close ")) return `إغلاق ${value.slice(6)}`;
    if (value.startsWith("Open ")) return `فتح ${value.slice(5)}`;
  }
  return value;
}

function translateTextNode(node: Text, locale: Locale) {
  if (shouldSkipNode(node)) return;
  const current = node.nodeValue ?? "";
  if (!current.trim()) return;
  const original = textOriginals.get(node) ?? current;
  textOriginals.set(node, original);
  const translated = translateValue(original, locale);
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
      const original = element.getAttribute(originalAttribute) ?? current;
      element.setAttribute(originalAttribute, original);
      const translated = translateValue(original, locale);
      if (current !== translated) element.setAttribute(name, translated);
    });
  });
}

function translateDocument(locale: Locale) {
  if (!document.body) return;
  document.documentElement.lang = locale;
  document.body.dataset.locale = locale;

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

  useEffect(() => {
    try {
      setLocaleState(normalizeLocale(window.localStorage.getItem(storageKey)));
    } catch {
      setLocaleState("en");
    }
  }, []);

  const value = useMemo<LocalizationContextValue>(() => ({
    locale,
    languages,
    setLocale: (nextLocale) => {
      try {
        window.localStorage.setItem(storageKey, nextLocale);
      } catch {
        // Browsers can block storage in private or restricted contexts.
      }
      setLocaleState(nextLocale);
    },
    translate: (text) => translateValue(text, locale),
  }), [locale]);

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
  }, [locale]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) throw new Error("useLocalization must be used inside LocalizationProvider");
  return context;
}
