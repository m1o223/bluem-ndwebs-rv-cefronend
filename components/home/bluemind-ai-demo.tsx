"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocalization, type Locale } from "../localization-provider";
import TextActionLabel from "../text-action-label";
import styles from "./bluemind-ai-demo.module.css";

type PlannerCopy = {
  title: string;
  prompts: [string, string, string];
  fieldLabel: string;
};

const copy: Record<Locale, PlannerCopy> = {
  en: {
    title: "Let’s plan your website",
    prompts: [
      "Help me plan a café website",
      "What pages do I need?",
      "Help me plan my online store",
    ],
    fieldLabel: "Website planning prompt preview",
  },
  sv: {
    title: "Vi planerar din webbplats",
    prompts: [
      "Hjälp mig planera en sida för mitt kafé",
      "Vilka sidor behöver jag?",
      "Hjälp mig planera min webbutik",
    ],
    fieldLabel: "Förhandsvisning av planeringsfråga",
  },
  ar: {
    title: "خلّينا نخطّط لموقعك",
    prompts: [
      "ساعدني أخطّط لموقع الكافيه",
      "شو الصفحات اللي بحتاجها؟",
      "ساعدني أخطّط لمتجري الإلكتروني",
    ],
    fieldLabel: "معاينة سؤال تخطيط الموقع",
  },
};

const sectionCopy = {
  en: {
    title: "Plan your website with BlueMind AI",
    description: "BlueMind AI helps you organize your ideas and plan your website. When you’re ready, it sends your request to our team. We’ll build your website and keep you updated every step of the way until we hand it over.",
    cta: "Get Started",
  },
  sv: {
    title: "Planera din webbplats med BlueMind AI",
    description: "BlueMind AI hjälper dig att strukturera dina idéer och planera din webbplats. När du är redo skickar det din förfrågan till vårt team. Vi bygger din webbplats och håller dig uppdaterad hela vägen tills vi överlämnar den till dig.",
    cta: "Kom igång",
  },
  ar: {
    title: "\u062e\u0637\u0651\u0637 \u0644\u0645\u0648\u0642\u0639\u0643 \u0645\u0639 BlueMind AI",
    description: "\u064a\u0633\u0627\u0639\u062f\u0643 BlueMind AI \u0639\u0644\u0649 \u062a\u0631\u062a\u064a\u0628 \u0623\u0641\u0643\u0627\u0631\u0643 \u0648\u0627\u0644\u062a\u062e\u0637\u064a\u0637 \u0644\u0645\u0648\u0642\u0639\u0643. \u0648\u0639\u0646\u062f\u0645\u0627 \u062a\u0643\u0648\u0646 \u062c\u0627\u0647\u0632\u064b\u0627\u060c \u064a\u0631\u0633\u0644 \u0637\u0644\u0628\u0643 \u0625\u0644\u0649 \u0641\u0631\u064a\u0642\u0646\u0627. \u0633\u0646\u0628\u0646\u064a \u0645\u0648\u0642\u0639\u0643 \u0648\u0646\u0628\u0642\u064a\u0643 \u0639\u0644\u0649 \u0627\u0637\u0644\u0627\u0639 \u0628\u0643\u0644 \u062e\u0637\u0648\u0629 \u062d\u062a\u0649 \u0646\u0633\u0644\u0651\u0645\u0647 \u0644\u0643.",
    cta: "\u0627\u0628\u062f\u0623 \u0627\u0644\u0622\u0646",
  },
} as const;

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    const legacyMedia = media as MediaQueryList & {
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };
    legacyMedia.addListener?.(update);
    return () => legacyMedia.removeListener?.(update);
  }, []);

  return reducedMotion;
}

export default function BlueMindAiDemo() {
  const { locale } = useLocalization();
  const text = copy[locale];
  const sectionText = sectionCopy[locale];
  const reducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    if (reducedMotion) {
      setDisplayed(text.prompts[0]);
      return () => {
        cancelled = true;
      };
    }

    setDisplayed("");
    let promptIndex = 0;
    let deleting = false;
    let current = "";

    const tick = () => {
      if (cancelled) return;
      const prompt = text.prompts[promptIndex];

      if (!deleting) {
        current = prompt.slice(0, current.length + 1);
        setDisplayed(current);
        if (current === prompt) {
          deleting = true;
          timer = setTimeout(tick, 300);
        } else {
          timer = setTimeout(tick, 45);
        }
        return;
      }

      current = current.slice(0, -1);
      setDisplayed(current);
      if (!current) {
        deleting = false;
        promptIndex = (promptIndex + 1) % text.prompts.length;
        tick();
      } else {
        timer = setTimeout(tick, 25);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [locale, reducedMotion, text.prompts]);

  return (
    <section
      className={styles.section}
      data-bluemind-ai
      data-no-translate
      dir={locale === "ar" ? "rtl" : "ltr"}
      aria-labelledby="bluemind-ai-title"
    >
      <div className={styles.inner}>
        <h2 id="bluemind-ai-title" className={styles.title}>{sectionText.title}</h2>
        <p className={styles.description}>{sectionText.description}</p>
        <div className={styles.plannerStage} data-ai-demo>
          <div className={styles.plannerGlow} aria-hidden="true" />
          <div
            className={styles.plannerField}
            data-planner-field
            role="status"
            aria-live="polite"
            aria-label={text.fieldLabel}
          >
            <span className={styles.plannerText}>{displayed}</span>
            <span className={styles.caret} aria-hidden="true" />
          </div>
        </div>
        <Link href="/ask-ai?source=homepage-planner&new=1" className={styles.cta}>
          <TextActionLabel light underline={false}>{sectionText.cta}</TextActionLabel>
        </Link>
      </div>
    </section>
  );
}
