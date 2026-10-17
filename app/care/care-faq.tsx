"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocalization } from "../../components/localization-provider";
import pageStyles from "../../components/page-identity.module.css";
import content from "./care-faq-data.json";
import styles from "./care.module.css";

export default function CareFaq({ children }: { children?: ReactNode }) {
  const { locale } = useLocalization();
  const faq = content[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <section className={`${styles.faq} ${pageStyles.enter}`} aria-labelledby="care-faq-title">
      <h2 id="care-faq-title" data-no-translate dir={direction}>{faq.title}</h2>
      <p className={styles.formIntro} data-no-translate dir={direction}>{faq.subtitle}</p>
      <div className={styles.questions} data-no-translate dir={direction}>
        {faq.questions.map((item, index) => (
          <details key={index}>
            <summary>{item.question}</summary>
            {item.answers.map((answer, answerIndex) => {
              if ("items" in answer && answer.items) return <ul key={answerIndex}>{answer.items.map(text => <li key={text}>{text}</li>)}</ul>;
              if ("link" in answer) return <p key={answerIndex}>{answer.before}<Link href="/contact" style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>{answer.link}</Link>{answer.after}</p>;
              return <p key={answerIndex}>{"label" in answer && <><strong>{answer.label}</strong>{" "}</>}{answer.text}</p>;
            })}
          </details>
        ))}
      </div>
      {children}
    </section>
  );
}
