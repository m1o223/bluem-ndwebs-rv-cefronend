import type { Locale } from "../localization-provider";
import type { StoryCopy } from "./animated-story";

export const meetAiCopy: Record<Locale, StoryCopy> = {
  "en": {
    "title": "Meet BlueMind AI",
    "steps": [
      [
        "Your idea",
        "Starts here"
      ],
      [
        "Explain your vision",
        "Find your direction"
      ],
      [
        "Organized thoughts",
        "Clear project brief"
      ],
      [
        "Your request",
        "Ready for review"
      ],
      [
        "Your project",
        "Step by step"
      ]
    ],
    "instructions": "Animation pauses while focused. Use Left and Right to read the steps. Space toggles playback after focus leaves."
  },
  "ar": {
    "title": "تعرّف على BlueMind AI",
    "steps": [
      [
        "فكرتك تبدأ",
        "من هنا"
      ],
      [
        "اشرح رؤيتك",
        "وحدّد اتجاهك"
      ],
      [
        "أفكار مرتبة",
        "مشروع واضح"
      ],
      [
        "طلبك منظّم",
        "للمراجعة مع الفريق"
      ],
      [
        "تابع مشروعك",
        "خطوة بخطوة"
      ]
    ],
    "instructions": "تتوقف الحركة أثناء التركيز. استخدم السهمين لقراءة الخطوات. مفتاح المسافة يبدّل تشغيل الحركة بعد مغادرة التركيز."
  },
  "sv": {
    "title": "Möt BlueMind AI",
    "steps": [
      [
        "Din idé",
        "Börjar här"
      ],
      [
        "Beskriv din vision",
        "Hitta din riktning"
      ],
      [
        "Organiserade tankar",
        "Ett tydligt projekt"
      ],
      [
        "Din förfrågan",
        "Redo för teamet"
      ],
      [
        "Följ ditt projekt",
        "Steg för steg"
      ]
    ],
    "instructions": "Animationen pausas vid fokus. Läs stegen med piltangenterna. Mellanslag växlar uppspelning när fokus lämnar."
  }
};
