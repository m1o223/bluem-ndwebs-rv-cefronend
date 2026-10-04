import Image from "next/image";
import Link from "next/link";
import homeStyles from "../../components/home/home.module.css";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { PlanetWatermark } from "../../components/planet-watermark";
import styles from "./how-we-work.module.css";

const steps = [
  { icon: "01-tell-us", title: "Tell Us What You Need", text: "Tell us about your idea, your business, and the website you have in mind." },
  { icon: "02-review", title: "We Review Your Project", text: "We review your request, your requirements, and the best way to build your website." },
  { icon: "03-choose", title: "Choose Your Direction", text: "We prepare up to four design concepts. You choose the direction you like most." },
  { icon: "04-build", title: "We Build & Refine", text: "Once you choose a direction, we build the website and refine the details with you." },
  { icon: "05-approve", title: "Review & Approval", text: "You review the finished website and make sure everything is right before final delivery." },
  { icon: "06-payment", title: "Payment", text: "Once everything is approved, we complete the payment before the final handover." },
  { icon: "07-delivery", title: "Final Delivery", text: "You receive your completed website, along with the files and access included in your project." },
];

export default function HowWeWorkPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body}>
        <div className={`${homeStyles.container} ${pageStyles.content}`}>
          <div className={`${pageStyles.intro} ${pageStyles.enter} ${styles.intro}`}>
            <h1>How We Work</h1>
            <p className={styles.headline}>From your idea to a finished website.</p>
            <p>A simple process designed to keep you involved from the first idea to the final delivery.</p>
          </div>
          <ol className={`${styles.timeline} ${pageStyles.enter}`} aria-label="Our website project process">
            {steps.map((step, index) => (
              <li key={step.icon} className={styles.step}>
                <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                <div className={styles.stepContent}>
                  <div className={styles.stepHeading}>
                    <Image src={`/images/how-we-work/${step.icon}.svg`} width={120} height={100} alt="" aria-hidden="true" className={styles.icon} />
                    <h2>{step.title}</h2>
                  </div>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <section className={`${styles.cta} ${pageStyles.enter}`} aria-labelledby="process-cta-title">
            <div>
              <h2 id="process-cta-title">Ready to start your website?</h2>
              <p>Tell us what you have in mind, and we’ll take it from there.</p>
            </div>
            <Link href="/quote" className={`${buttonStyles.ctaButton} ${buttonStyles.primaryCta}`}>Request a Quote</Link>
          </section>
        </div>
        <PlanetWatermark className={styles.watermark} sizes="(max-width: 620px) 400px, (max-width: 1050px) 640px, 800px" />
      </div>
    </div>
  );
}
