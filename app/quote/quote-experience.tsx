"use client";

import { useEffect, useState } from "react";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { StarMark } from "../../components/star-mark";
import { getStripeCheckoutStatus, type StripeCheckoutStatus } from "../lib/api-client";
import { packages } from "./quote-data";
import PurchaseFlow from "./purchase-flow";
import styles from "./quote.module.css";

type Package = (typeof packages)[number];
type FixedPackage = Package & { checkoutId: string; price: string };
const buttonClass = `${buttonStyles.ctaButton} ${buttonStyles.primaryCta} ${styles.button}`;

export default function QuoteExperience() {
  const [interactive, setInteractive] = useState(false);
  const [checkoutPackage, setCheckoutPackage] = useState<FixedPackage | null>(null);
  const [returnSessionId, setReturnSessionId] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<StripeCheckoutStatus | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});
  const isPackageExpanded = (packageId: string) => expandedPackages[packageId] === true;
  useEffect(() => {
    setInteractive(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("checkout_session_id") || "";
    if (sessionId) {
      setReturnSessionId(sessionId);
      setCheckoutStatus(null);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (params.get("checkout_cancelled")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!returnSessionId) return;
    let cancelled = false;
    let attempts = 0;
    let timeout = 0;
    async function pollStatus() {
      attempts += 1;
      const result = await getStripeCheckoutStatus(returnSessionId);
      if (cancelled) return;
      setCheckoutStatus(result);
      if (result.success && result.order) return;
      if (attempts < 12) timeout = window.setTimeout(pollStatus, 2500);
    }
    pollStatus();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [returnSessionId]);

  function isFixedPackage(item: Package): item is FixedPackage {
    return /SEK/i.test(item.price);
  }
  const successfulCheckoutStatus = checkoutStatus?.success ? checkoutStatus : null;
  const returnedOrder = successfulCheckoutStatus?.order || null;
  const returnedOrderIsSandbox = Boolean(returnedOrder?.isSandboxTestOrder || returnedOrder?.testMode || returnedOrder?.paymentMode === "test" || returnedOrder?.stripeLivemode === false || successfulCheckoutStatus?.paymentMode === "test" || successfulCheckoutStatus?.stripeLivemode === false);

  return (
    <>
      <div className={`${styles.valueIntro} ${pageStyles.enter}`}>
        <StarMark className={styles.star} />
        <div><h2>More included. No unnecessary extras.</h2><p>Professional websites built for desktop, tablet and mobile — included as standard.</p></div>
      </div>
      <section className={`${styles.pricing} ${pageStyles.enter}`} aria-label="Website packages and starting prices">
        {packages.map(item => (
          <article key={item.id} className={`${styles.package} ${item.popular ? styles.popular : ""}`} aria-labelledby={`package-${item.id}`}>
            <div className={styles.packageTop}><span>{item.id}</span>{item.popular && <span className={styles.badge}><StarMark className={styles.star} />{"badge" in item ? item.badge : "MOST POPULAR"}</span>}</div>
            <div className={styles.summary}>
              <h2 id={`package-${item.id}`}>{item.title}</h2>
              <p className={styles.price}>{item.price.startsWith("From ") ? <><span>From </span>{item.price.slice(5)}</> : item.price}</p>
              <p className={styles.delivery}>{item.delivery}</p>
              {item.scope && <p className={styles.scope}>{item.scope}</p>}
            </div>
            <p className={styles.description}>{item.description}</p>
            <ul className={styles.featureList}>
              {item.features.slice(0, isPackageExpanded(item.checkoutId) ? item.features.length : item.visibleFeatures).map((feature, index) => (
                <li key={feature} className={index >= item.visibleFeatures ? styles.featureExtra : undefined}>
                  <StarMark className={styles.star} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {item.features.length > item.visibleFeatures && (
              <div className={styles.expandBlock}>
                <button type="button" className={styles.expandButton} aria-expanded={isPackageExpanded(item.checkoutId)} onClick={() => setExpandedPackages(current => ({ ...current, [item.checkoutId]: current[item.checkoutId] !== true }))}>
                  <span>{isPackageExpanded(item.checkoutId) ? "Show Less" : "Show More"}</span>
                  <span aria-hidden="true">{isPackageExpanded(item.checkoutId) ? "\u2191" : "\u2193"}</span>
                </button>
              </div>
            )}
            {"vatNote" in item && <p className={styles.customNote}>{item.vatNote}</p>}
            <button type="button" className={buttonClass} disabled={!interactive} onClick={() => isFixedPackage(item) && setCheckoutPackage(item)}>{item.cta}</button>
          </article>
        ))}
      </section>
      <PurchaseFlow selectedPackage={checkoutPackage} onClose={() => setCheckoutPackage(null)} />
      {returnSessionId && (
        <div className={styles.checkoutBackdrop} role="presentation">
          <div className={styles.checkoutModal} role="dialog" aria-modal="true" aria-labelledby="stripe-return-title">
            <button type="button" className={styles.checkoutClose} aria-label="Close checkout status" onClick={() => setReturnSessionId("")}>X</button>
            <div className={styles.checkoutStep}>
              {checkoutStatus?.success && checkoutStatus.order ? (
                <div className={styles.successState}>
                  <h2 id="stripe-return-title">{returnedOrderIsSandbox ? "Sandbox test payment confirmed" : "Payment confirmed"}</h2>
                  <p>{returnedOrderIsSandbox ? "Stripe confirmed this in test mode. This is not a real paid customer order and no live card was charged." : "Your order has been created after Stripe confirmed the live payment."}</p>
                  <div className={styles.orderNumber}><span>Your Order Number</span><strong>{checkoutStatus.order.orderNumber}</strong></div>
                  {checkoutStatus.amounts && <dl className={styles.paymentSummary}><div><dt>Total</dt><dd>{checkoutStatus.amounts.total}</dd></div><div><dt>Paid</dt><dd>{checkoutStatus.amounts.paid}</dd></div><div><dt>Remaining</dt><dd>{checkoutStatus.amounts.remaining}</dd></div></dl>}
                  <p className={styles.demoNotice}>{returnedOrderIsSandbox ? "TEST MODE: keep this separate from real customer revenue and live paid orders." : "Confirmation is generated by the backend after the verified Stripe webhook, not by the browser redirect."}</p>
                  <button type="button" className={buttonClass} onClick={() => setReturnSessionId("")}>Done</button>
                </div>
              ) : checkoutStatus?.success && checkoutStatus.status === "not_found" ? (
                <div className={styles.errorState}>
                  <span aria-hidden="true">!</span>
                  <h2 id="stripe-return-title">Checkout session not found.</h2>
                  <p>We could not find this Stripe Checkout session. Please contact BlueMind if money was charged.</p>
                  <button type="button" className={buttonClass} onClick={() => setReturnSessionId("")}>Close</button>
                </div>
              ) : checkoutStatus?.success && ["payment_failed", "expired", "amount_mismatch", "unpaid"].includes(checkoutStatus.status) ? (
                <div className={styles.errorState}>
                  <span aria-hidden="true">!</span>
                  <h2 id="stripe-return-title">{checkoutStatus.status === "expired" ? "Checkout expired" : "Payment not confirmed"}</h2>
                  <p>{checkoutStatus.status === "amount_mismatch" ? "Stripe reported an amount that did not match BlueMind pricing, so no order was confirmed." : checkoutStatus.status === "payment_failed" || checkoutStatus.status === "unpaid" ? "Stripe did not confirm a successful payment, so no order was created." : "This checkout session expired before payment was confirmed."}</p>
                  <button type="button" className={buttonClass} onClick={() => setReturnSessionId("")}>Close</button>
                </div>
              ) : checkoutStatus && !checkoutStatus.success ? (
                <div className={styles.errorState}>
                  <span aria-hidden="true">!</span>
                  <h2 id="stripe-return-title">We could not confirm the payment yet.</h2>
                  <p>{checkoutStatus.error}</p>
                  <button type="button" className={buttonClass} onClick={() => setReturnSessionId("")}>Close</button>
                </div>
              ) : (
                <div className={styles.processingState}>
                  <span className={styles.checkoutSpinner} aria-hidden="true" />
                  <h2 id="stripe-return-title">Preparing your order...</h2>
                  <p>Stripe is confirming the payment. Please keep this window open.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={styles.disclaimer}>
        <p>Starting prices. Final price and delivery time depend on your project requirements.</p>
        <p>Third-party costs such as domains, hosting, shipping carrier fees, payment-provider fees, paid plugins, and external service subscriptions are not included unless stated otherwise.</p>
      </div>
    </>
  );
}
