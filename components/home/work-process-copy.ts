import type { Locale } from "../localization-provider";

type ProcessCopy = {
  title: string;
  description: string;
  action: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  steps: readonly string[];
};

export const workProcessCopy: Record<Locale, ProcessCopy> = {
  en: {
    title: "How We Work",
    description: "From your first idea to a finished website, we handle the design, development, testing, and final delivery.",
    action: "Start your project",
    previous: "Previous step", next: "Next step", pause: "Pause animation", play: "Play animation",
    steps: [
      "Share your idea with us.",
      "Tell us what you want to build.",
      "We listen carefully and understand your goals.",
      "We organize your idea into a clear project plan.",
      "Our BlueMind Web Service team designs the experience.",
      "Our team develops your idea into a real website.",
      "We make sure the website works on mobile, tablet, and desktop.",
      "We test the important details before delivery.",
      "You review the finished project with our team.",
      "Your website is ready to use and ready to receive visitors or orders.",
    ],
  },
  ar: {
    title: "كيف نعمل",
    description: "من أول فكرة إلى موقع جاهز، نحن نهتم بالتصميم والبرمجة والاختبار والتسليم النهائي.",
    action: "ابدأ مشروعك",
    previous: "الخطوة السابقة", next: "الخطوة التالية", pause: "إيقاف الحركة مؤقتًا", play: "تشغيل الحركة",
    steps: [
      "شارك فكرتك معنا.",
      "أخبرنا ماذا تريد أن تبني.",
      "نستمع لك ونفهم أهدافك.",
      "نرتب فكرتك ضمن خطة واضحة للمشروع.",
      "فريق BlueMind Web Service يصمم تجربة الموقع.",
      "فريقنا يحول فكرتك إلى موقع حقيقي.",
      "نتأكد أن الموقع يعمل على الموبايل والتابلت والكمبيوتر.",
      "نختبر التفاصيل المهمة قبل التسليم.",
      "تراجع المشروع النهائي مع فريقنا.",
      "يصبح موقعك جاهزًا للاستخدام واستقبال الزوار أو الطلبات.",
    ],
  },
  sv: {
    title: "Så arbetar vi",
    description: "Från din första idé till en färdig webbplats tar vi hand om design, utveckling, testning och slutleverans.",
    action: "Starta ditt projekt",
    previous: "Föregående steg", next: "Nästa steg", pause: "Pausa animationen", play: "Spela animationen",
    steps: [
      "Dela din idé med oss.",
      "Berätta vad du vill bygga.",
      "Vi lyssnar noggrant och förstår dina mål.",
      "Vi organiserar din idé till en tydlig projektplan.",
      "Vårt BlueMind Web Service-team designar upplevelsen.",
      "Vårt team utvecklar din idé till en riktig webbplats.",
      "Vi ser till att webbplatsen fungerar på mobil, surfplatta och dator.",
      "Vi testar de viktiga detaljerna innan leveransen.",
      "Du granskar det färdiga projektet tillsammans med vårt team.",
      "Din webbplats är redo att användas och ta emot besökare eller beställningar.",
    ],
  },
};
