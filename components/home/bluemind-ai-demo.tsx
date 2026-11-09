"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import ChatWorkspace from "../../app/ask-ai/chat-workspace";
import { useLocalization } from "../localization-provider";
import styles from "./bluemind-ai-demo.module.css";

type Locale = "en" | "ar" | "sv";

const copy: Record<Locale, { title: string; helpTitle: string; helpBody: string; ask: string }> = {
  en: {
    title: "BlueMind AI",
    helpTitle: "How can BlueMind AI help you?",
    helpBody: "Tell it about your website idea in your own words. It helps you prepare your request and walks you through the plans and payment options so you can choose what works for you. Once your request is sent to the team, it tracks your website's progress and keeps you updated until delivery.",
    ask: "Ask BlueMind AI",
  },
  ar: {
    title: "BlueMind AI",
    helpTitle: "كيف بيساعدك BlueMind AI؟",
    helpBody: "احكيله فكرة موقعك بكلماتك. بيساعدك ترتّبها وتجهّز طلبك، وبيشرحلك الخطط وطرق الدفع حتى تختار اللي بناسبك. وبعد ما يرسل طلبك للفريق، بيتابع تقدّم موقعك خطوة بخطوة وبيبعتلك تحديثات لحد ما تستلمه.",
    ask: "جرّب BlueMind AI",
  },
  sv: {
    title: "BlueMind AI",
    helpTitle: "Hur kan BlueMind AI hjälpa dig?",
    helpBody: "Berätta om din webbplatsidé med dina egna ord. BlueMind AI hjälper dig att förbereda din förfrågan och guidar dig genom planer och betalningsalternativ. När förfrågan skickas till teamet följer den projektets framsteg och håller dig uppdaterad tills leverans.",
    ask: "Fråga BlueMind AI",
  },
};

export default function BlueMindAiDemo() {
  const { locale: selectedLocale } = useLocalization();
  const locale = (selectedLocale === "ar" || selectedLocale === "sv" ? selectedLocale : "en") as Locale;
  const text = copy[locale];

  return <section className={styles.section} data-bluemind-ai data-no-translate dir={locale === "ar" ? "rtl" : "ltr"} aria-labelledby="bluemind-ai-title">
    <div className={styles.inner}>
      <div className={styles.demo} data-ai-demo>
        <div className={styles.tabletFrame}>
          <div className={styles.tabletScreen} dir="ltr">
            <ChatWorkspace available embedded />
          </div>
        </div>
      </div>
      <div className={styles.copy}>
        <h2 id="bluemind-ai-title" className={styles.title}>{text.title}</h2>
        <h3>{text.helpTitle}</h3>
        <p>{text.helpBody}</p>
        <Link href="/ask-ai?source=what-we-build&new=1" className={styles.mobileCta}>{text.ask}<ArrowUp size={16} /></Link>
      </div>
    </div>
  </section>;
}
