import type { Locale } from "./localization-provider";

export type CookieConsentCopy = {
  title: string;
  description: string;
  acceptAll: string;
  rejectAll: string;
  customize: string;
  save: string;
  close: string;
  settingsTitle: string;
  necessary: string;
  necessaryDescription: string;
  analytics: string;
  analyticsDescription: string;
  marketing: string;
  marketingDescription: string;
  settingsLink: string;
  privacyLink: string;
};

export const cookieConsentCopy: Record<Locale, CookieConsentCopy> = {
  en: {
    title: "Your cookie choices",
    description: "We use necessary storage to keep the site working. Optional analytics and marketing storage stays off until you choose it.",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    customize: "Customize",
    save: "Save choices",
    close: "Close",
    settingsTitle: "Cookie settings",
    necessary: "Necessary",
    necessaryDescription: "Required for language preferences, sign-in sessions, security and core site functions.",
    analytics: "Analytics",
    analyticsDescription: "Optional measurement that helps us understand site use. None is currently loaded by this frontend.",
    marketing: "Marketing",
    marketingDescription: "Optional advertising or campaign storage. None is currently loaded by this frontend.",
    settingsLink: "Cookie settings",
    privacyLink: "Read the Privacy Policy",
  },
  sv: {
    title: "Dina cookieval",
    description: "Vi använder nödvändig lagring för att webbplatsen ska fungera. Valfri analys- och marknadsföringslagring är avstängd tills du väljer den.",
    acceptAll: "Acceptera alla",
    rejectAll: "Avvisa alla",
    customize: "Anpassa",
    save: "Spara val",
    close: "Stäng",
    settingsTitle: "Cookieinställningar",
    necessary: "Nödvändiga",
    necessaryDescription: "Krävs för språkval, inloggningssessioner, säkerhet och webbplatsens grundfunktioner.",
    analytics: "Analys",
    analyticsDescription: "Valfri mätning som hjälper oss förstå hur webbplatsen används. Inget sådant laddas av denna frontend just nu.",
    marketing: "Marknadsföring",
    marketingDescription: "Valfri lagring för annonser eller kampanjer. Inget sådant laddas av denna frontend just nu.",
    settingsLink: "Cookieinställningar",
    privacyLink: "Läs integritetspolicyn",
  },
  ar: {
    title: "اختيارات ملفات تعريف الارتباط",
    description: "نستخدم التخزين الضروري ليعمل الموقع. تبقى أدوات التحليل والتسويق الاختيارية متوقفة حتى تختار تفعيلها.",
    acceptAll: "قبول الكل",
    rejectAll: "رفض الكل",
    customize: "تخصيص",
    save: "حفظ الاختيارات",
    close: "إغلاق",
    settingsTitle: "إعدادات ملفات تعريف الارتباط",
    necessary: "ضرورية",
    necessaryDescription: "مطلوبة للغة والجلسات وتسجيل الدخول والأمان ووظائف الموقع الأساسية.",
    analytics: "التحليل",
    analyticsDescription: "قياس اختياري يساعدنا على فهم استخدام الموقع. لا يتم تحميل أداة تحليل حالياً من هذه الواجهة.",
    marketing: "التسويق",
    marketingDescription: "تخزين اختياري للإعلانات أو الحملات. لا يتم تحميل أداة تسويق حالياً من هذه الواجهة.",
    settingsLink: "إعدادات ملفات تعريف الارتباط",
    privacyLink: "اقرأ سياسة الخصوصية",
  },
};

