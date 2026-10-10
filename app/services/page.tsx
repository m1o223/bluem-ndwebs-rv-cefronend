import Image from "next/image";
import icons from "../../public/images/services/manifest.json";
import Link from "next/link";
import homeStyles from "../../components/home/home.module.css";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import styles from "./services.module.css";

const services = [
  { icon: "idea-to-ready" as const, title: "Your Idea, Your Website", text: "Any idea you have, we can turn into a website built around your vision." },
  { icon: "no-knowledge" as const, title: "No Technical Knowledge Needed", text: "You don’t need to know coding, design, or technical terms. Just tell us what you want." },
  { icon: "explain-idea" as const, title: "Can’t Explain Your Idea?", text: "Use ChatGPT to help describe it, send us the result, and we’ll take it from there." },
  { icon: "fast-delivery" as const, title: "Fast Delivery", text: "Your website can be ready in as little as 5 days, depending on the project." },
  { icon: "ready-website" as const, title: "Everything Ready for You", text: "We handle the design, development, setup, pages, and links so you receive a website ready to use." },
  { icon: "no-headaches" as const, title: "No Technical Headaches", text: "No coding. No complicated setup. You give us the direction, and we handle the technical work." },
];

function ServiceIcon({ name, className = "" }: { name: keyof typeof icons; className?: string }) {
  const icon = icons[name];
  return <Image src={icon.src} width={icon.width} height={icon.height} alt="" aria-hidden="true" unoptimized className={`${styles.icon} ${className}`} />;
}

export default function ServicesPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body}>
        <div className={`${homeStyles.container} ${pageStyles.content}`}>
          <div className={`${pageStyles.intro} ${pageStyles.enter} ${styles.intro}`}>
            <div className={`${styles.titleGroup} ${styles.mainTitle}`}><ServiceIcon name="services-hand" className={styles.mainIcon} /><h1>Services</h1></div>
            <p className={`${styles.headline} ${styles.titleGroup}`}><ServiceIcon name="client-to-team" className={styles.headlineIcon} /><span>You bring the idea. We handle the rest.</span></p>
            <p>Tell us what you want, and we’ll turn your idea into a polished, ready-to-use website — without the technical headaches.</p>
          </div>
          <div className={`${styles.sections} ${pageStyles.enter}`}>
            {services.map((service, index) => (
              <section key={service.title} className={styles.section} aria-labelledby={`service-${index + 1}`}>
                <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                <div>
                  <div className={styles.titleGroup}><ServiceIcon name={service.icon} className={service.icon === "no-knowledge" ? styles.compactIcon : service.icon === "no-headaches" ? styles.relaxedIcon : styles.sectionIcon} /><h2 id={`service-${index + 1}`}>{service.title}</h2></div>
                  <p>{service.text}</p>
                </div>
              </section>
            ))}
          </div>
          <section className={`${styles.cta} ${pageStyles.enter}`} aria-labelledby="services-cta-title">
            <div>
              <div className={styles.titleGroup}><ServiceIcon name="website-idea" className={styles.ctaIcon} /><h2 id="services-cta-title">Have an idea for your website?</h2></div>
              <p>Tell us what you have in mind. We’ll help turn it into a real website.</p>
            </div>
            <Link href="/quote" className={`${buttonStyles.ctaButton} ${buttonStyles.primaryCta}`}>Request a Quote</Link>
          </section>
        </div>
      </div>
    </div>
  );
}
