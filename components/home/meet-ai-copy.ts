import type { Locale } from "../localization-provider";
import type { StoryCopy } from "./animated-story";

export const meetAiCopy: Record<Locale, StoryCopy> = {
  "en": {
    "title": "Meet BlueMind AI",
    "steps": [
      "Tell BlueMind AI about your idea.",
      "It helps you explain your project.",
      "It organizes your thoughts clearly.",
      "It prepares your request for the team.",
      "You can follow your project step by step."
    ],
    "instructions": "Animation pauses while focused. Use Left and Right to read the steps. Space toggles playback after focus leaves."
  },
  "ar": {
    "title": "تعرّف على BlueMind AI",
    "steps": [
      "احكِ لـ BlueMind AI عن فكرتك.",
      "يساعدك على شرح مشروعك.",
      "يرتب أفكارك بوضوح.",
      "يجهز طلبك للفريق.",
      "يمكنك متابعة مشروعك خطوة بخطوة."
    ],
    "instructions": "تتوقف الحركة أثناء التركيز. استخدم السهمين لقراءة الخطوات. مفتاح المسافة يبدّل تشغيل الحركة بعد مغادرة التركيز."
  },
  "sv": {
    "title": "Möt BlueMind AI",
    "steps": [
      "Berätta för BlueMind AI om din idé.",
      "Den hjälper dig att beskriva ditt projekt.",
      "Den strukturerar dina tankar tydligt.",
      "Den förbereder din förfrågan för teamet.",
      "Du kan följa ditt projekt steg för steg."
    ],
    "instructions": "Animationen pausas vid fokus. Läs stegen med piltangenterna. Mellanslag växlar uppspelning när fokus lämnar."
  }
};
