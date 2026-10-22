"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useLocalization } from "../localization-provider";
import styles from "./ai-coming-soon.module.css";

const labels = { en: "Ask BlueMind AI", sv: "Fr\u00e5ga BlueMind AI", ar: "\u0627\u0633\u0623\u0644 BlueMind AI" };

export default function AiComingSoon({ triggerClassName }: { triggerClassName: string }) {
  const { locale, translate } = useLocalization();
  return <Link href="/ask-ai" className={`${triggerClassName} ${styles.trigger}`} aria-label={labels[locale]} data-no-translate>
    <span className={styles.sizer} aria-hidden="true">{translate("Explore Concepts")}</span>
    <span className={styles.label} aria-hidden="true" dir="auto">{labels[locale]}<Sparkles size={15} /></span>
  </Link>;
}
