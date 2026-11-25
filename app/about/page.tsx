import Image from "next/image";
import {
  Check,
  ClipboardCheck,
  Eye,
  LayoutTemplate,
  MessageSquare,
  MousePointer2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import styles from "./about.module.css";

type PreviewKind = "feedback" | "detail";
type AboutSection = { id: string; title: string; points: string[]; preview: PreviewKind };
type WorkStep = { icon: string; title: string; text: string };

const aboutSections: AboutSection[] = [
  {
    id: "why-choose-us",
    title: "Why Choose Us",
    preview: "feedback",
    points: [
      "We work fast without compromising on quality.",
      "We keep you involved throughout the entire project.",
      "Want something changed? Just tell us, and we’ll work with you to adjust it.",
      "Your feedback matters at every step.",
    ],
  },
  {
    id: "what-makes-us-different",
    title: "What Makes Us Different",
    preview: "detail",
    points: [
      "We have deep knowledge of web design and development.",
      "We pay attention to every detail.",
      "We make working with us simple and flexible.",
      "High-quality websites without the high price.",
    ],
  },
];

const workflowPrinciples = [
  "You tell us your idea, and we turn it into a real website.",
  "We communicate with you throughout the process.",
  "We listen to your feedback and make the changes you need.",
  "Our goal is to build a website that truly fits you and your business.",
];

const workSteps: WorkStep[] = [
  { icon: "01-tell-us", title: "Tell Us What You Need", text: "Tell us about your idea, your business, and the website you have in mind." },
  { icon: "02-review", title: "We Review Your Project", text: "We review your request, your requirements, and the best way to build your website." },
  { icon: "03-choose", title: "Choose Your Direction", text: "We prepare up to four design concepts. You choose the direction you like most." },
  { icon: "04-build", title: "We Build & Refine", text: "Once you choose a direction, we build the website and refine the details with you." },
  { icon: "05-approve", title: "Review & Approval", text: "You review the finished website and make sure everything is right before final delivery." },
  { icon: "06-payment", title: "Payment", text: "Once everything is approved, we complete the payment before the final handover." },
  { icon: "07-delivery", title: "Final Delivery", text: "You receive your completed website, along with the files and access included in your project." },
];

function BrowserBar() {
  return <div className={styles.browserBar} aria-hidden="true">
    <span className={styles.browserDots}><i /><i /><i /></span>
    <span className={styles.browserAddress}><span /><span /><span /></span>
    <span className={styles.browserMenu}><i /><i /><i /></span>
  </div>;
}

function FeedbackPreview() {
  return <div className={`${styles.preview} ${styles.feedbackPreview}`} aria-hidden="true">
    <span className={styles.previewGlow} />
    <div className={styles.previewWindow}>
      <BrowserBar />
      <div className={styles.websitePreview}>
        <span className={styles.previewHeading} />
        <span className={styles.previewCopyLine} />
        <span className={styles.previewCopyLineShort} />
        <div className={styles.previewTiles}><i /><i /><i /></div>
      </div>
    </div>
    <div className={styles.feedbackBubble}>
      <MessageSquare size={18} strokeWidth={1.7} />
      <span><i /><i /></span>
      <Check className={styles.feedbackCheck} size={15} strokeWidth={2.2} />
    </div>
    <span className={styles.feedbackPointer}><MousePointer2 size={24} strokeWidth={1.7} /></span>
    <span className={styles.feedbackLink} />
  </div>;
}

function DetailPreview() {
  return <div className={`${styles.preview} ${styles.detailPreview}`} aria-hidden="true">
    <span className={styles.previewGlow} />
    <div className={styles.detailDesktop}>
      <BrowserBar />
      <div className={styles.detailLayout}>
        <div className={styles.detailHero}><span /><span /><span /></div>
        <div className={styles.detailRows}><i /><i /><i /></div>
        <div className={styles.detailPalette}><i /><i /><i /><i /></div>
      </div>
    </div>
    <div className={styles.detailCallout}>
      <Sparkles size={17} strokeWidth={1.7} />
      <span><i /><i /><i /></span>
    </div>
    <div className={styles.detailPhone}>
      <span className={styles.phoneTop} /><span className={styles.phoneHero} />
      <span className={styles.phoneRow} /><span className={styles.phoneRowShort} />
    </div>
    <span className={styles.detailLink} />
  </div>;
}

function SectionPreview({ kind }: { kind: PreviewKind }) {
  return kind === "feedback" ? <FeedbackPreview /> : <DetailPreview />;
}

function StepPreview({ icon }: { icon: string }) {
  return <div className={styles.stepVisual} aria-hidden="true">
    <Image src={`/images/how-we-work/${icon}.svg`} width={240} height={200} loading="eager" alt="" className={styles.stepImage} />
  </div>;
}

function WorkflowPrinciple({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return <li><span className={styles.principleIcon}><Icon size={16} strokeWidth={1.8} aria-hidden="true" /></span><span>{text}</span></li>;
}

export default function AboutPage() {
  return (
    <div id="top" className={`${homeStyles.home} ${pageStyles.page}`}>
      <div className={pageStyles.body}>
        <div className={`${homeStyles.container} ${pageStyles.content} ${styles.content}`}>
          <header className={`${pageStyles.intro} ${pageStyles.enter} ${styles.intro}`}>
            <h1>About Us</h1>
            <p>Websites built around your ideas, with professional work, clear communication, and fair pricing.</p>
          </header>

          <div className={`${styles.aboutSections} ${pageStyles.enter}`}>
            {aboutSections.map((section, index) => (
              <section key={section.id} id={section.id} className={`${styles.aboutSection} ${index % 2 ? styles.reverse : ""}`} aria-labelledby={`${section.id}-title`}>
                <div className={styles.sectionCopy}>
                  <span className={styles.sectionNumber}>0{index + 1}</span>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  <ul className={styles.pointList}>{section.points.map(point => <li key={point}>{point}</li>)}</ul>
                </div>
                <div className={styles.sectionPreview}><SectionPreview kind={section.preview} /></div>
              </section>
            ))}

            <section id="about-how-we-work" className={`${styles.workflowSection} ${styles.aboutSection}`} aria-labelledby="about-how-we-work-title">
              <div className={styles.workflowIntro}>
                <div className={styles.sectionCopy}>
                  <span className={styles.sectionNumber}>03</span>
                  <h2 id="about-how-we-work-title">How We Work</h2>
                  <p className={styles.workflowHeadline}>From your idea to a finished website.</p>
                  <p className={styles.workflowSupporting}>A simple process designed to keep you involved from the first idea to the final delivery.</p>
                </div>
                <div className={styles.workflowPrinciples}>
                  <ul>
                    <WorkflowPrinciple icon={MessageSquare} text={workflowPrinciples[0]} />
                    <WorkflowPrinciple icon={Eye} text={workflowPrinciples[1]} />
                    <WorkflowPrinciple icon={ClipboardCheck} text={workflowPrinciples[2]} />
                    <WorkflowPrinciple icon={LayoutTemplate} text={workflowPrinciples[3]} />
                  </ul>
                </div>
              </div>

              <ol className={styles.workflowSteps} aria-label="Our website project process">
                {workSteps.map((step, index) => <li key={step.icon} className={`${styles.workflowStep} ${index % 2 ? styles.stepRight : styles.stepLeft}`}>
                  <div className={styles.stepCard}>
                    <div className={styles.stepVisualFrame}>
                      <span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span>
                      <StepPreview icon={step.icon} />
                    </div>
                    <article className={styles.stepCopy} aria-labelledby={`about-work-step-${index + 1}`}>
                      <h3 id={`about-work-step-${index + 1}`}>{step.title}</h3>
                      <p>{step.text}</p>
                    </article>
                  </div>
                  {index < workSteps.length - 1 && <span className={styles.stepConnector} aria-hidden="true" />}
                </li>)}
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
