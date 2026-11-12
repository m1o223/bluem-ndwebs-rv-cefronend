"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useLocalization } from "../localization-provider";
import TextActionLabel from "../text-action-label";
import { whatWeBuildCopy } from "./what-we-build-copy";
import BlueMindAiDemo from "./bluemind-ai-demo";
import CategoryDemoViewer from "./category-demo";
import { demoCategories, type DemoCategoryId } from "./category-demo-data";
import styles from "./what-we-do.module.css";

const titles = { en: "What We Do", ar: "شو منعمل؟", sv: "Vad vi gör" } as const;
const exampleTitles = { en: "Website Examples", ar: "\u0623\u0645\u062b\u0644\u0629 \u0645\u0648\u0627\u0642\u0639", sv: "Exempel p\u00e5 webbplatser" } as const;

export default function WhatWeDo() {
  const { locale } = useLocalization();
  const text = whatWeBuildCopy[locale];
  const [selectedCategory, setSelectedCategory] = useState<DemoCategoryId | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeDemo = useCallback(() => {
    setSelectedCategory(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  return <section className={styles.section} data-what-we-do data-no-translate dir={locale === "ar" ? "rtl" : "ltr"} aria-labelledby="what-we-do-title">
    <div className={styles.inner}>
      <p className={styles.eyebrow}>BLUEMIND WEB SERVICE</p>
      <h2 id="what-we-do-title" className={styles.title}>{titles[locale]}</h2>
      <div className={styles.folioDevices} data-folio-devices dir="ltr" aria-label="Folio Books responsive website previews">
        <div className={`${styles.folioDevice} ${styles.folioDesktop}`} data-folio-device="desktop">
          <Image src="/images/folio-books/folio-desktop.webp" alt={text.desktop} width={1280} height={882} sizes="(max-width: 620px) 54vw, 470px" />
        </div>
        <div className={`${styles.folioDevice} ${styles.folioTablet}`} data-folio-device="tablet">
          <Image src="/images/folio-books/folio-tablet.webp" alt={text.tablet} width={1100} height={769} sizes="(max-width: 620px) 34vw, 350px" />
        </div>
        <div className={`${styles.folioDevice} ${styles.folioPhone}`} data-folio-device="phone">
          <Image src="/images/folio-books/folio-phone.webp" alt={text.phone} width={640} height={1296} sizes="(max-width: 620px) 16vw, 140px" />
        </div>
      </div>
      <div className={styles.examplesCard} data-demo-examples>
        <h3 className={styles.examplesTitle}>{exampleTitles[locale]}</h3>
        <div className={styles.types} aria-label={exampleTitles[locale]} data-demo-categories>
          {demoCategories.map(category => <button
            key={category.id}
            ref={element => { if (selectedCategory === category.id) opener.current = element; }}
            type="button"
            className={styles.typeButton}
            data-demo-category={category.id}
            data-active={selectedCategory === category.id}
            aria-pressed={selectedCategory === category.id}
            onClick={(event) => { opener.current = event.currentTarget; setSelectedCategory(category.id); }}
          >
            <span>{category.label[locale]}</span><ArrowRight size={15} aria-hidden="true" />
          </button>)}
        </div>
      </div>
      <p className={styles.features}>{text.features}</p>
      <div className={styles.invitation}>
        <p className={styles.invitationTitle}>{text.invitationTitle}</p>
        <p className={styles.invitationBody}>{text.invitationBody}</p>
      </div>
      <Link href="/ask-ai?source=what-we-build&new=1" className={styles.cta}><TextActionLabel light underline={false}>{text.cta}</TextActionLabel><ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>
    <BlueMindAiDemo />
    {selectedCategory && <CategoryDemoViewer category={selectedCategory} onClose={closeDemo} />}
  </section>;
}
