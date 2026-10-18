import icons from "../../public/images/about/manifest.json";

export const sections = [
  {
    id: "why-choose-us", title: "Why Choose Us", question: true, icon: icons["quality-check"],
    points: [
      "We work fast without compromising on quality.",
      "We keep you involved throughout the entire project.",
      "Want something changed? Just tell us, and we\u2019ll work with you to adjust it.",
      "Your feedback matters at every step.",
    ],
  },
  {
    id: "what-makes-us-different", title: "What Makes Us Different", question: true, icon: icons["distinctive-bulbs"],
    points: [
      "We have deep knowledge of web design and development.",
      "We pay attention to every detail.",
      "We make working with us simple and flexible.",
      "High-quality websites without the high price.",
    ],
  },
  {
    id: "how-we-work", title: "How We Work", question: false, icon: icons["idea-to-website"],
    points: [
      "You tell us your idea, and we turn it into a real website.",
      "We communicate with you throughout the process.",
      "We listen to your feedback and make the changes you need.",
      "Our goal is to build a website that truly fits you and your business.",
    ],
  },
] as const;
