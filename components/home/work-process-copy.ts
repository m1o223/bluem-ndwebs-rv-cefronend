import type { Locale } from "../localization-provider";
import type { StoryCopy } from "./animated-story";

export const workProcessCopy: Record<Locale, StoryCopy> = {
  "en": {
    "title": "How We Work",
    "steps": [
      "Share your idea with us.",
      "We understand your goals.",
      "We organize your idea clearly.",
      "Our team designs your website.",
      "We develop and test your project.",
      "Your website is ready to use."
    ],
    "instructions": "Animation pauses while focused. Use Left and Right to read the steps. Space toggles playback after focus leaves."
  },
  "ar": {
    "title": "كيف نعمل",
    "steps": [
      "شارك فكرتك معنا.",
      "نفهم أهدافك.",
      "نرتب فكرتك بوضوح.",
      "فريقنا يصمم موقعك.",
      "نطوّر مشروعك ونختبره.",
      "موقعك جاهز للاستخدام."
    ],
    "instructions": "تتوقف الحركة أثناء التركيز. استخدم السهمين لقراءة الخطوات. مفتاح المسافة يبدّل تشغيل الحركة بعد مغادرة التركيز."
  },
  "sv": {
    "title": "Så arbetar vi",
    "steps": [
      "Dela din idé med oss.",
      "Vi förstår dina mål.",
      "Vi strukturerar din idé tydligt.",
      "Vårt team designar din webbplats.",
      "Vi utvecklar och testar ditt projekt.",
      "Din webbplats är redo att användas."
    ],
    "instructions": "Animationen pausas vid fokus. Läs stegen med piltangenterna. Mellanslag växlar uppspelning när fokus lämnar."
  }
};
