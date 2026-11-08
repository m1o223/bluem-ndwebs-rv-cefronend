"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import { useLocalization } from "../localization-provider";
import styles from "./payment-methods.module.css";

type PaymentMethod = { name: string; asset?: string; featured?: boolean };

const paymentMethods: readonly PaymentMethod[] = [
  { name: "Klarna", asset: "/images/footer/klarna.svg", featured: true },
  { name: "Swish", asset: "/images/footer/swish.svg" },
  { name: "Faktura" },
  { name: "Visa", asset: "/images/footer/visa.png" },
  { name: "Mastercard", asset: "/images/footer/mastercard.svg" },
  { name: "Apple Pay", asset: "/images/footer/apple-pay.svg" },
  { name: "Google Pay", asset: "/images/footer/google-pay.svg" },
  { name: "PayPal", asset: "/images/footer/paypal.svg" },
  { name: "American Express", asset: "/images/footer/american-express.svg" },
  { name: "Alipay", asset: "/images/footer/alipay.svg" },
  { name: "mada", asset: "/images/footer/mada.svg" },
  { name: "Pix", asset: "/images/footer/pix.svg" },
];

const titles = { en: "Payment methods", ar: "طرق الدفع", sv: "Betalningsmetoder" } as const;

function PaymentSet({ duplicate = false }: { duplicate?: boolean }) {
  return <div className={styles.paymentSet} data-payment-set={duplicate ? "duplicate" : "primary"} aria-hidden={duplicate}>
    {paymentMethods.map(method => <div key={`${duplicate ? "duplicate" : "primary"}-${method.name}`} className={`${styles.paymentItem} ${method.featured ? styles.paymentFeatured : ""}`} data-payment-name={method.name}>
      {method.asset ? <Image src={method.asset} alt={method.name} width={120} height={40} sizes="120px" /> : <span className={styles.invoiceMark}><FileText size={18} strokeWidth={1.7} aria-hidden="true" /><span>{method.name}</span></span>}
    </div>)}
  </div>;
}

export default function PaymentMethods() {
  const { locale } = useLocalization();
  return <section className={styles.paymentMethods} aria-labelledby="payment-methods-title" data-payment-methods data-no-translate dir={locale === "ar" ? "rtl" : "ltr"}>
    <h2 id="payment-methods-title" className={styles.paymentTitle}>{titles[locale]}</h2>
    <div className={styles.paymentViewport}>
      <div className={styles.paymentTrack} data-payment-track>
        <PaymentSet />
        <PaymentSet duplicate />
      </div>
    </div>
  </section>;
}
