import type { ReactNode } from "react";
import Image from "next/image";
import { Check, CheckCircle2, Clock3, ListChecks, MessageCircle, Monitor, MousePointer2, Settings2, Smartphone } from "lucide-react";
import icons from "../../public/images/services/manifest.json";
import homeStyles from "../../components/home/home.module.css";
import buttonStyles from "../../components/home/hero.module.css";
import pageStyles from "../../components/page-identity.module.css";
import { AiComingSoonLink } from "../../components/ai-coming-soon";
import styles from "./services.module.css";

const services = [
  { visual: "idea" as const, title: "Your Idea, Your Website", text: "Any idea you have, we can turn it into a website built around your vision." },
  { visual: "knowledge" as const, title: "No Technical Knowledge Needed", text: "You don’t need to know coding, design, or technical terms. Just tell us what you want." },
  { visual: "explain" as const, title: "Can’t Explain Your Idea?", text: "Use ChatGPT to help describe it, send us the result, and we’ll take it from there." },
  { visual: "delivery" as const, title: "Fast Delivery", text: "Your website can be ready in as little as 5 days, depending on the project." },
  { visual: "ready" as const, title: "Everything Ready for You", text: "We handle the design, development, setup, pages, and links so you receive a website ready to use." },
  { visual: "headaches" as const, title: "No Technical Headaches", text: "No coding. No complicated setup. You give us the direction, and we handle the technical work." },
];

type ServiceVisual = (typeof services)[number]["visual"];

function ServiceIcon({ name, className = "" }: { name: keyof typeof icons; className?: string }) {
  const icon = icons[name];
  return <Image src={icon.src} width={icon.width} height={icon.height} alt="" aria-hidden="true" unoptimized className={`${styles.icon} ${className}`} />;
}

function PreviewWindow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`${styles.previewWindow} ${className}`}>
      <span className={styles.previewWindowBar}><i /><i /><i /></span>
      {children}
    </span>
  );
}

function ServicePreview({ kind }: { kind: ServiceVisual }) {
  if (kind === "idea") {
    return (
      <div className={`${styles.preview} ${styles.previewIdea}`} aria-hidden="true">
        <span className={styles.previewGlow} />
        <span className={styles.ideaBubble}><MessageCircle /></span>
        <span className={styles.ideaConnector} />
        <PreviewWindow className={styles.ideaWindow}>
          <span className={styles.previewHero} />
          <span className={styles.previewLine} />
          <span className={styles.previewLineShort} />
          <span className={styles.previewTiles}><i /><i /><i /></span>
        </PreviewWindow>
      </div>
    );
  }

  if (kind === "knowledge") {
    return (
      <div className={`${styles.preview} ${styles.previewKnowledge}`} aria-hidden="true">
        <span className={styles.previewGlow} />
        <PreviewWindow className={styles.knowledgeWindow}>
          <span className={styles.previewLine} />
          <span className={styles.optionRow}><i /><span /><b><Check /></b></span>
          <span className={styles.optionRow}><i /><span /><b /></span>
          <span className={styles.optionRow}><i /><span /><b /></span>
          <span className={styles.previewFooter}><span /><span /><span /></span>
        </PreviewWindow>
        <MousePointer2 className={styles.previewPointer} />
      </div>
    );
  }

  if (kind === "explain") {
    return (
      <div className={`${styles.preview} ${styles.previewExplain}`} aria-hidden="true">
        <span className={styles.previewGlow} />
        <span className={`${styles.chatBubble} ${styles.chatBubbleTop}`}><i /><i /><i /></span>
        <span className={`${styles.chatBubble} ${styles.chatBubbleBottom}`}><i /><i /></span>
        <PreviewWindow className={styles.explainWindow}>
          <span className={styles.previewNav} />
          <span className={styles.previewHeroSmall} />
          <span className={styles.previewLine} />
          <span className={styles.previewLineShort} />
          <span className={styles.previewTiles}><i /><i /></span>
        </PreviewWindow>
      </div>
    );
  }

  if (kind === "delivery") {
    return (
      <div className={`${styles.preview} ${styles.previewDelivery}`} aria-hidden="true">
        <span className={styles.previewGlow} />
        <PreviewWindow className={styles.deliveryWindow}>
          <span className={styles.previewHero} />
          <span className={styles.previewLine} />
          <span className={styles.previewLineShort} />
          <span className={styles.previewTiles}><i /><i /><i /></span>
        </PreviewWindow>
        <span className={styles.clockBadge}><Clock3 /></span>
        <span className={styles.checkBadge}><CheckCircle2 /></span>
      </div>
    );
  }

  if (kind === "ready") {
    return (
      <div className={`${styles.preview} ${styles.previewReady}`} aria-hidden="true">
        <span className={styles.previewGlow} />
        <span className={styles.deviceMonitor}><Monitor /><span className={styles.deviceScreen}><i /><i /><i /></span></span>
        <span className={styles.devicePhone}><Smartphone /><span className={styles.phoneScreen}><i /><i /><i /></span></span>
        <span className={styles.readyList}><ListChecks /><i /><i /><i /></span>
      </div>
    );
  }

  return (
    <div className={`${styles.preview} ${styles.previewHeadaches}`} aria-hidden="true">
      <span className={styles.previewGlow} />
      <span className={styles.settingsPanel}><Settings2 /><i /><i /><i /></span>
      <PreviewWindow className={styles.headachesWindow}>
        <span className={styles.previewNav} />
        <span className={styles.previewHeroSmall} />
        <span className={styles.previewLine} />
        <span className={styles.previewLineShort} />
      </PreviewWindow>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body}>
        <div className={`${homeStyles.container} ${pageStyles.content} ${styles.content}`}>
          <div className={`${pageStyles.intro} ${pageStyles.enter} ${styles.intro}`}>
            <div className={`${styles.titleGroup} ${styles.mainTitle}`}><ServiceIcon name="services-hand" className={styles.mainIcon} /><h1>Services</h1></div>
            <p className={`${styles.headline} ${styles.titleGroup}`}><ServiceIcon name="client-to-team" className={styles.headlineIcon} /><span>You bring the idea. We handle the rest.</span></p>
            <p>Tell us what you want, and we’ll turn your idea into a polished, ready-to-use website — without the technical headaches.</p>
            <div className={styles.introActions}>
              <AiComingSoonLink href="/ask-ai" className={`${buttonStyles.ctaButton} ${buttonStyles.primaryCta}`}>Get Started with BlueMind AI</AiComingSoonLink>
            </div>
          </div>
          <div className={`${styles.sections} ${pageStyles.enter}`} data-reveal-exclude>
            {services.map((service, index) => (
              <section key={service.title} className={styles.section} aria-labelledby={`service-${index + 1}`}>
                <div className={styles.sectionPreview}><span className={styles.number} aria-hidden="true">0{index + 1}</span><ServicePreview kind={service.visual} /></div>
                <div className={styles.sectionCopy}><h2 id={`service-${index + 1}`}>{service.title}</h2><p>{service.text}</p></div>
              </section>
            ))}
          </div>
          <section className={`${styles.cta} ${pageStyles.enter}`} data-reveal-skip aria-labelledby="services-cta-title">
            <div>
              <div className={styles.titleGroup}><ServiceIcon name="website-idea" className={styles.ctaIcon} /><h2 id="services-cta-title">Have an idea for your website?</h2></div>
              <p>Tell us what you have in mind. We’ll help turn it into a real website.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
