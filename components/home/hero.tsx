import AiPageLink from "./ai-page-link";
import HeroVisual from "./hero-visual";
import PaymentMethods from "./payment-methods";
import shared from "./home.module.css";
import styles from "./hero.module.css";
import TextActionLabel from "../text-action-label";
import { ComingSoonLink } from "../ai-coming-soon";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title" data-hero>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.headline}>
            <span>Have a website idea?</span>{" "}
            <span>We'll build it.</span>
          </h1>
          <p className={styles.description}>Online stores, restaurant websites, portfolios, and custom sites built around your needs.</p>
          <div className={`${shared.actions} ${styles.actions}`}>
            <ComingSoonLink href="/quote" kind="pricing" className={`${styles.ctaButton} ${styles.primaryCta}`}><TextActionLabel light underline={false}>Get Started</TextActionLabel></ComingSoonLink>
            <AiPageLink triggerClassName={styles.ctaButton} />
          </div>
        </div>
        <HeroVisual />
        <PaymentMethods />
      </div>
    </section>
  );
}
