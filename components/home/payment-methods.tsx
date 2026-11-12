"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import { useLocalization } from "../localization-provider";
import { homepagePaymentMethods } from "./homepage-payment-methods";
import styles from "./payment-methods.module.css";

const titles = { en: "Payment methods", ar: "طرق الدفع", sv: "Betalningsmetoder" } as const;
const invoiceLabels = { en: "Invoice", ar: "فاتورة", sv: "Faktura" } as const;

function PaymentSet({ duplicate = false, invoiceLabel }: { duplicate?: boolean; invoiceLabel: string }) {
  return <div className={styles.paymentSet} data-payment-set={duplicate ? "duplicate" : "primary"} aria-hidden={duplicate}>
    {homepagePaymentMethods.map(method => <div key={`${duplicate ? "duplicate" : "primary"}-${method.name}`} className={styles.paymentItem} data-payment-name={method.name}>
      {method.asset ? <Image src={method.asset} alt={method.name} width={120} height={40} sizes="120px" loading="eager" /> : <span className={styles.invoiceMark}><FileText size={18} strokeWidth={1.7} aria-hidden="true" /><span>{invoiceLabel}</span></span>}
    </div>)}
  </div>;
}

export default function PaymentMethods() {
  const { locale } = useLocalization();
  return <section className={styles.paymentMethods} aria-labelledby="payment-methods-title" data-payment-methods data-no-translate dir={locale === "ar" ? "rtl" : "ltr"}>
    <h2 id="payment-methods-title" className={styles.paymentTitle}>{titles[locale]}</h2>
    <div className={styles.paymentViewport}>
      <div className={styles.paymentTrack} data-payment-track>
        <PaymentSet invoiceLabel={invoiceLabels[locale]} />
        <PaymentSet duplicate invoiceLabel={invoiceLabels[locale]} />
      </div>
    </div>
  </section>;
}
