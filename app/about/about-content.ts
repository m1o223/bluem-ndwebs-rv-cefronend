export type AboutSection = {
  id: string;
  title: string;
  points: string[];
};

export type WorkStep = {
  title: string;
  points: string[];
};

export const aboutIntro = "Websites built around your ideas, with professional work, clear communication, and fair pricing.";

export const aboutSections: AboutSection[] = [
  {
    id: "why-choose-us",
    title: "Why Choose Us",
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
    points: [
      "We have deep knowledge of web design and development.",
      "We pay attention to every detail.",
      "We make working with us simple and flexible.",
      "High-quality websites without the high price.",
    ],
  },
];

export const workflowHeadline = "From your idea to a finished website.";
export const workflowSupporting = "A simple process designed to keep you involved from the first idea to the final delivery.";

export const workflowPrinciples = [
  "You tell us your idea, and we turn it into a real website.",
  "We communicate with you throughout the process.",
  "We listen to your feedback and make the changes you need.",
  "Our goal is to build a website that truly fits you and your business.",
];

export const workSteps: WorkStep[] = [
  { title: "Tell Us What You Need", points: ["Tell us about your idea, your business, and the website you have in mind."] },
  { title: "We Review Your Project", points: ["We review your request, your requirements, and the best way to build your website."] },
  { title: "Choose Your Direction", points: ["We prepare up to four design concepts. You choose the direction you like most."] },
  { title: "We Build & Refine", points: ["Once you choose a direction, we build the website and refine the details with you."] },
  { title: "Review & Approval", points: ["You review the finished website and make sure everything is right before final delivery."] },
  { title: "Payment", points: ["Once everything is approved, we complete the payment before the final handover."] },
  { title: "Final Delivery", points: ["You receive your completed website, along with the files and access included in your project."] },
];
