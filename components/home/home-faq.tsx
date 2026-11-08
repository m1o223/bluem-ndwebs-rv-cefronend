"use client";

import Link from "next/link";
import { useLocalization } from "../localization-provider";
import { faqCopy } from "../faq/faq-copy";
import FaqList from "../faq/faq-list";
import styles from "./home-faq.module.css";

export default function HomeFaq() {
  const { locale } = useLocalization();
  const copy = faqCopy[locale];

  return (
    <section className={styles.section} data-home-faq>
      <div className={styles.inner}>
        <FaqList id="home-faq-title" items={copy.items.slice(0, 4)} title={copy.title} />
        <Link href="/faq" className={styles.link}>{copy.viewAll}</Link>
      </div>
    </section>
  );
}
