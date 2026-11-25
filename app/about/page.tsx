import Image from "next/image";
import {
  Check,
  ClipboardCheck,
  Eye,
  LayoutTemplate,
  MessageSquare,
  MousePointer2,
  type LucideIcon,
} from "lucide-react";
import homeStyles from "../../components/home/home.module.css";
import pageStyles from "../../components/page-identity.module.css";
import styles from "./about.module.css";

type PreviewKind = "feedback" | "different";
type AboutSection = { id: string; title: string; points: string[]; preview: PreviewKind };
type WorkStep = { src: string; title: string; text: string; alt: string };

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
    preview: "different",
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
  { src: "/images/how-we-work/how-01-tell-us-what-you-need.jpg", alt: "A person explains a website idea at a laptop with a message preview and lightbulb.", title: "Tell Us What You Need", text: "Tell us about your idea, your business, and the website you have in mind." },
  { src: "/images/how-we-work/how-02-we-review-your-project.jpg", alt: "A project plan is reviewed on a screen beside a checklist and magnifying glass.", title: "We Review Your Project", text: "We review your request, your requirements, and the best way to build your website." },
  { src: "/images/how-we-work/how-03-choose-your-direction.jpg", alt: "Four website design concepts are shown while one selected concept is marked with a check.", title: "Choose Your Direction", text: "We prepare up to four design concepts. You choose the direction you like most." },
  { src: "/images/how-we-work/how-04-we-build-and-refine.jpg", alt: "A website is refined in an editor with color, alignment, and spacing controls.", title: "We Build & Refine", text: "Once you choose a direction, we build the website and refine the details with you." },
  { src: "/images/how-we-work/how-05-review-and-approval.jpg", alt: "A completed website is reviewed on desktop and mobile with a thumbs-up approval.", title: "Review & Approval", text: "You review the finished website and make sure everything is right before final delivery." },
  { src: "/images/how-we-work/how-06-payment.jpg", alt: "A payment card, website preview, payment form, and approved receipt are shown together.", title: "Payment", text: "Once everything is approved, we complete the payment before the final handover." },
  { src: "/images/how-we-work/how-07-final-delivery.jpg", alt: "A designer hands a blue website project folder to a client beside completed device previews.", title: "Final Delivery", text: "You receive your completed website, along with the files and access included in your project." },
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

function DifferentPreview() {
  return <div className={`${styles.preview} ${styles.imagePreview}`}>
    <Image
      src="/images/about/about-what-makes-us-different.jpg"
      width={1280}
      height={853}
      sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1050px) calc(100vw - 56px), 54vw"
      alt="A website shown on a desktop computer, landscape tablet, and portrait phone."
      className={styles.sectionImage}
    />
  </div>;
}

function SectionPreview({ kind }: { kind: PreviewKind }) {
  return kind === "feedback" ? <FeedbackPreview /> : <DifferentPreview />;
}

function StepPreview({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  return <div className={styles.stepVisual}>
    <Image src={src} width={1280} height={853} priority={eager} alt={alt} sizes="(max-width: 760px) calc(100vw - 72px), (max-width: 1050px) 54vw, 45vw" className={styles.stepImage} />
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
                {workSteps.map((step, index) => <li key={step.src} className={`${styles.workflowStep} ${index % 2 ? styles.stepRight : styles.stepLeft}`}>
                  <div className={styles.stepCard}>
                    <div className={styles.stepVisualFrame}>
                      <span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span>
                      <StepPreview src={step.src} alt={step.alt} eager={index === 0} />
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
