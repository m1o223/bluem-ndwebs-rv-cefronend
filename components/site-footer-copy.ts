import type { Locale } from "./localization-provider";

export type FooterLinkItem = { href: string; label: string };

export type FooterCopy = {
  ariaLabel: string;
  tagline: string;
  explore: string;
  services: string;
  contact: string;
  email: string;
  contactUs: string;
  follow: string;
  payments: string;
  paymentNote: string;
  copyright: string;
  legalLinks: FooterLinkItem[];
  cookieSettings: string;
  exploreLinks: FooterLinkItem[];
  serviceLinks: FooterLinkItem[];
};

export const footerCopy: Record<Locale, FooterCopy> = {
  en: {
    ariaLabel: "BlueMind Web Service footer",
    tagline: "Your idea. Our expertise. Built for the web.",
    explore: "Explore",
    services: "Services",
    contact: "Contact",
    email: "Email",
    contactUs: "Contact Us",
    follow: "Follow BlueMind Web Service",
    payments: "Payment methods",
    paymentNote: "Available options are confirmed before payment.",
    copyright: "All rights reserved.",
    legalLinks: [{ href: "/privacy", label: "Privacy Policy" }, { href: "/cookies", label: "Cookie Policy" }, { href: "/security-policy", label: "Security Policy" }],
    cookieSettings: "Cookie settings",
    exploreLinks: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About Us" },
      { href: "/services", label: "Services" },
      { href: "/about#about-how-we-work", label: "How We Work" },
      { href: "/#selected-work", label: "Website Concepts" },
      { href: "/our-work", label: "Our Work" },
      { href: "/faq", label: "FAQ" },
      { href: "/quote", label: "Request a Quote" },
      { href: "/contact", label: "Contact" },
      { href: "/care", label: "Website Care" },
      { href: "/security", label: "Security" },
      { href: "/reviews", label: "Reviews" },
    ],
    serviceLinks: [
      { href: "/services", label: "Website Design" },
      { href: "/quote", label: "Business Websites" },
      { href: "/quote", label: "Online Stores" },
      { href: "/quote", label: "Custom Websites" },
      { href: "/care", label: "BlueMind Care" },
    ],
  },
  sv: {
    ariaLabel: "Sidfot för BlueMind Web Service",
    tagline: "Din idé. Vår expertis. Byggd för webben.",
    explore: "Utforska",
    services: "Tjänster",
    contact: "Kontakt",
    email: "E-post",
    contactUs: "Kontakta oss",
    follow: "Följ BlueMind Web Service",
    payments: "Betalningsmetoder",
    paymentNote: "Tillgängliga alternativ bekräftas före betalning.",
    copyright: "Alla rättigheter förbehållna.",
    legalLinks: [{ href: "/privacy", label: "Integritetspolicy" }, { href: "/cookies", label: "Cookiepolicy" }, { href: "/security-policy", label: "Säkerhetspolicy" }],
    cookieSettings: "Cookieinställningar",
    exploreLinks: [
      { href: "/", label: "Hem" },
      { href: "/about", label: "Om oss" },
      { href: "/services", label: "Tjänster" },
      { href: "/about#about-how-we-work", label: "Så arbetar vi" },
      { href: "/#selected-work", label: "Webbplatskoncept" },
      { href: "/our-work", label: "Vårt arbete" },
      { href: "/faq", label: "Vanliga frågor" },
      { href: "/quote", label: "Begär en offert" },
      { href: "/contact", label: "Kontakt" },
      { href: "/care", label: "Webbplatsvård" },
      { href: "/security", label: "Säkerhet" },
      { href: "/reviews", label: "Recensioner" },
    ],
    serviceLinks: [
      { href: "/services", label: "Webbdesign" },
      { href: "/quote", label: "Företagswebbplatser" },
      { href: "/quote", label: "Webbbutiker" },
      { href: "/quote", label: "Anpassade webbplatser" },
      { href: "/care", label: "BlueMind Care" },
    ],
  },
  ar: {
    ariaLabel: "تذييل BlueMind Web Service",
    tagline: "فكرتك. خبرتنا. موقع جاهز للويب.",
    explore: "استكشف",
    services: "الخدمات",
    contact: "التواصل",
    email: "البريد الإلكتروني",
    contactUs: "تواصل معنا",
    follow: "تابع BlueMind Web Service",
    payments: "طرق الدفع",
    paymentNote: "يتم تأكيد الخيارات المتاحة قبل الدفع.",
    copyright: "جميع الحقوق محفوظة.",
    legalLinks: [{ href: "/privacy", label: "سياسة الخصوصية" }, { href: "/cookies", label: "سياسة الكوكيز" }, { href: "/security-policy", label: "سياسة الأمان" }],
    cookieSettings: "إعدادات ملفات تعريف الارتباط",
    exploreLinks: [
      { href: "/", label: "الرئيسية" },
      { href: "/about", label: "من نحن" },
      { href: "/services", label: "الخدمات" },
      { href: "/about#about-how-we-work", label: "كيف نعمل" },
      { href: "/#selected-work", label: "مفاهيم المواقع" },
      { href: "/our-work", label: "أعمالنا" },
      { href: "/faq", label: "الأسئلة الشائعة" },
      { href: "/quote", label: "طلب عرض سعر" },
      { href: "/contact", label: "التواصل" },
      { href: "/care", label: "رعاية المواقع" },
      { href: "/security", label: "الأمان" },
      { href: "/reviews", label: "آراء العملاء" },
    ],
    serviceLinks: [
      { href: "/services", label: "تصميم المواقع" },
      { href: "/quote", label: "مواقع الأعمال" },
      { href: "/quote", label: "المتاجر الإلكترونية" },
      { href: "/quote", label: "مواقع مخصصة" },
      { href: "/care", label: "BlueMind Care" },
    ],
  },
};
