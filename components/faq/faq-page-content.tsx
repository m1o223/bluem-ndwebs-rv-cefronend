"use client";

import { useLocalization } from "../localization-provider";
import FaqList from "./faq-list";
import { faqCopy } from "./faq-copy";
import pageStyles from "../page-identity.module.css";

export default function FaqPageContent() {
  const { locale } = useLocalization();
  const copy = faqCopy[locale];
  const sectionTitle = locale === "ar" ? "الأسئلة" : locale === "sv" ? "Frågor" : "Questions";
  return (
    <>
      <div className={`${pageStyles.intro} ${pageStyles.enter}`}>
        <h1>{copy.title}</h1>
        <p>{locale === "ar" ? "إجابات عن الأسئلة الشائعة حول BlueMind Web Service." : locale === "sv" ? "Svar på vanliga frågor om BlueMind Web Service." : "Answers to common questions about BlueMind Web Service."}</p>
      </div>
      <FaqList id="faq-page-title" items={copy.items} title={sectionTitle} />
    </>
  );
}
