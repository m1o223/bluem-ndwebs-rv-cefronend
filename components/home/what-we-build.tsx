"use client";

import Image from "next/image";
import { ArrowUpRight, FileText } from "lucide-react";
import { useLocalization } from "../localization-provider";
import TextActionLabel from "../text-action-label";
import { AiComingSoonLink } from "../ai-coming-soon";
import { whatWeBuildCopy } from "./what-we-build-copy";
import styles from "./what-we-build.module.css";

type PaymentMethod = { name: string; asset?: string; featured?: boolean; invoice?: boolean };

const paymentMethods: readonly PaymentMethod[] = [
  { name: "Klarna", asset: "/images/footer/klarna.svg", featured: true },
  { name: "Swish", asset: "/images/footer/swish.svg" },
  { name: "Faktura", invoice: true },
  { name: "Visa", asset: "/images/footer/visa.png" },
  { name: "Mastercard", asset: "/images/footer/mastercard.svg" },
  { name: "Apple Pay", asset: "/images/footer/apple-pay.svg" },
  { name: "Google Pay", asset: "/images/footer/google-pay.svg" },
  { name: "PayPal", asset: "/images/footer/paypal.svg" },
  { name: "American Express", asset: "/images/footer/american-express.svg" },
  { name: "Alipay", asset: "/images/footer/alipay.svg" },
  { name: "mada", asset: "/images/footer/mada.svg" },
  { name: "Pix", asset: "/images/footer/pix.svg" },
] as const;

const paymentTitles = {
  en: "Payment methods",
  ar: "طرق الدفع",
  sv: "Betalningsmetoder",
} as const;

export default function WhatWeBuild() {
  const { locale } = useLocalization();
  const text = whatWeBuildCopy[locale];
  return <section className={styles.section} data-build-section data-hero-visual data-started="true" dir={locale === "ar" ? "rtl" : "ltr"} data-no-translate aria-labelledby="what-we-build-title">
    <h2 id="what-we-build-title" className={styles.title}>{text.title}</h2>
    <div className={styles.stage} data-build-stage>
      <div className={styles.group} data-build-group dir="ltr">
        <div className={`${styles.device} ${styles.desktop}`} data-build-device="desktop"><Image src="/images/folio-books/folio-desktop.webp" alt={text.desktop} width={1280} height={882} sizes="(max-width: 620px) 34vw, 430px" loading="eager" /></div>
        <div className={`${styles.device} ${styles.tablet}`} data-build-device="tablet"><Image src="/images/folio-books/folio-tablet.webp" alt={text.tablet} width={1100} height={769} sizes="(max-width: 620px) 28vw, 360px" loading="eager" fetchPriority="high" /></div>
        <div className={`${styles.device} ${styles.phone}`} data-build-device="phone"><Image src="/images/folio-books/folio-phone.webp" alt={text.phone} width={640} height={1296} sizes="(max-width: 620px) 15vw, 170px" loading="eager" /></div>
      </div>
    </div>
    <div className={styles.content}>
      <p className={styles.description} data-build-description>{text.description}</p>
      <ul className={styles.types} aria-label={text.title}>{text.types.map(type => <li key={type}>{type}</li>)}</ul>
      <p className={styles.features}>{text.features}</p>
      <div className={styles.invitation}>
        <p className={styles.invitationTitle}>{text.invitationTitle}</p>
        <p className={styles.invitationBody}>{text.invitationBody}</p>
      </div>
      <AiComingSoonLink href="/ask-ai?source=what-we-build&new=1" className={styles.cta}><TextActionLabel light underline={false}>{text.cta}</TextActionLabel><ArrowUpRight size={18} aria-hidden="true" /></AiComingSoonLink>
      <section className={styles.payments} aria-labelledby="payment-methods-title">
        <h3 id="payment-methods-title" className={styles.paymentTitle}>{paymentTitles[locale]}</h3>
        <div className={styles.paymentViewport}>
          <div className={styles.paymentTrack} data-payment-track>
            <div className={styles.paymentSet} data-payment-set="primary">
              {paymentMethods.map(method => <div key={method.name} className={`${styles.paymentItem} ${method.featured ? styles.paymentFeatured : ""}`} data-payment-name={method.name}>
                {method.asset ? <Image src={method.asset} alt={method.name} width={120} height={40} sizes="120px" /> : <span className={styles.invoiceMark}><FileText size={18} strokeWidth={1.7} aria-hidden="true" /><span>{method.name}</span></span>}
              </div>)}
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>;
}
