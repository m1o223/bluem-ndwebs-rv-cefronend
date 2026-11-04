import type { Locale } from "../localization-provider";
import type { StoryCopy } from "./animated-story";

export const meetAiCopy: Record<Locale, StoryCopy> = {
  en: {
    title: "Meet BlueMind AI",
    description: "BlueMind AI helps you clarify your idea, prepare your request, and follow your project until it is ready.",
    clarification: "The BlueMind Web Service team handles the design, development, and final delivery.",
    action: "Start with BlueMind AI",
    previous: "Previous step", next: "Next step", pause: "Pause animation", play: "Play animation",
    steps: [
      "Tell BlueMind AI about your idea.",
      "It asks the right questions to understand what you need.",
      "It organizes your thoughts into a clear project idea.",
      "It helps you choose the right style, colors, and direction.",
      "It prepares your request in a clear and organized way.",
      "Your request is sent to the BlueMind Web Service team.",
      "You can follow your project step by step.",
      "BlueMind AI keeps you updated throughout the process.",
      "From your first question to your finished website.",
    ],
  },
  ar: {
    title: "تعرّف على BlueMind\u00a0AI",
    description: "يساعدك BlueMind AI على توضيح فكرتك، وتجهيز طلبك، ومتابعة مشروعك حتى يصبح جاهزًا.",
    clarification: "يتولى فريق BlueMind Web Service التصميم والبرمجة والتنفيذ النهائي.",
    action: "ابدأ مع BlueMind AI",
    previous: "الخطوة السابقة", next: "الخطوة التالية", pause: "إيقاف الحركة مؤقتًا", play: "تشغيل الحركة",
    steps: [
      "احكِ لـ BlueMind AI عن فكرتك.",
      "يسألك الأسئلة المناسبة حتى يفهم ماذا تحتاج.",
      "يرتب أفكارك ويحوّلها إلى فكرة مشروع واضحة.",
      "يساعدك على اختيار الأسلوب والألوان والاتجاه المناسب.",
      "يجهز طلبك بطريقة واضحة ومرتبة.",
      "يرسل طلبك إلى فريق BlueMind Web Service.",
      "يمكنك متابعة مشروعك خطوة بخطوة.",
      "يبقيك على اطلاع خلال مراحل العمل.",
      "من أول سؤال إلى موقعك الجاهز.",
    ],
  },
  sv: {
    title: "Möt BlueMind AI",
    description: "BlueMind AI hjälper dig att förtydliga din idé, förbereda din förfrågan och följa projektet tills det är klart.",
    clarification: "BlueMind Web Service-teamet ansvarar för design, utveckling och slutleverans.",
    action: "Börja med BlueMind AI",
    previous: "Föregående steg", next: "Nästa steg", pause: "Pausa animationen", play: "Spela animationen",
    steps: [
      "Berätta för BlueMind AI om din idé.",
      "Den ställer rätt frågor för att förstå vad du behöver.",
      "Den organiserar dina tankar till en tydlig projektidé.",
      "Den hjälper dig att välja rätt stil, färger och riktning.",
      "Den förbereder din förfrågan på ett tydligt och organiserat sätt.",
      "Din förfrågan skickas till BlueMind Web Service-teamet.",
      "Du kan följa ditt projekt steg för steg.",
      "BlueMind AI håller dig uppdaterad under hela processen.",
      "Från din första fråga till din färdiga webbplats.",
    ],
  },
};
