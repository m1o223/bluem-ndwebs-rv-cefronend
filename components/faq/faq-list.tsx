"use client";

import type { FaqItem } from "./faq-copy";
import { useLocalization } from "../localization-provider";
import styles from "./faq-list.module.css";

export default function FaqList({
  id,
  items,
  title,
  subtitle,
}: {
  id: string;
  items: FaqItem[];
  title: string;
  subtitle?: string;
}) {
  const { locale } = useLocalization();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <section className={styles.faq} aria-labelledby={id} data-faq-list data-no-translate dir={direction}>
      <h2 id={id}>{title}</h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      <div className={styles.questions}>
        {items.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
