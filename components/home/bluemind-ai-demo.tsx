"use client";

import { useEffect, useState } from "react";
import { useLocalization, type Locale } from "../localization-provider";
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
        <h2 id="bluemind-ai-title" className={styles.title}>
          {text.title}
        </h2>
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
      </div>
    </section>
  );
}
