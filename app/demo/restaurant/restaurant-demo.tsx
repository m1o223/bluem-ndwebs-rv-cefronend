"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocalization, type Locale } from "../../../components/localization-provider";
import styles from "./restaurant-demo.module.css";

type Section = "home" | "menu" | "about" | "gallery" | "contact";
type MenuCategory = "pizza" | "pasta" | "grill" | "salads" | "desserts" | "drinks";
type DemoVariant = "restaurant" | "cafe" | "studio" | "services";
type PreviewDevice = "desktop" | "tablet" | "mobile";

const sectionPaths: Record<Section, string> = {
  home: "/demo/restaurant",
  menu: "/demo/restaurant/menu",
  about: "/demo/restaurant/about",
  gallery: "/demo/restaurant/gallery",
  contact: "/demo/restaurant/contact",
};

const copy: Record<Locale, {
  nav: Record<Section, string>;
  menuCategories: Record<MenuCategory, string>;
  demoLabel: string;
  back: string;
  menuCta: string;
  explore: string;
  formName: string;
  formEmail: string;
  formMessage: string;
  formSend: string;
  formSuccess: string;
  close: string;
  sample: string;
  noTransactions: string;
  previewKicker: string;
  previewModel: string;
  previewDevice: string;
  desktop: string;
  tablet: string;
  mobile: string;
  fullscreen: string;
  exitFullscreen: string;
  closePreview: string;
  modelNames: Record<DemoVariant, string>;
}> = {
  en: {
    nav: { home: "Home", menu: "Menu", about: "About Us", gallery: "Gallery", contact: "Contact" },
    menuCategories: { pizza: "Pizza", pasta: "Pasta", grill: "Grill", salads: "Salads", desserts: "Desserts", drinks: "Drinks" },
    demoLabel: "BlueMind showcase demo",
    back: "Back to pricing",
    menuCta: "View the menu",
    explore: "Explore the restaurant",
    formName: "Your name",
    formEmail: "Email address",
    formMessage: "Your message",
    formSend: "Send a demo message",
    formSuccess: "Thanks. This is a demo confirmation; nothing was sent or stored.",
    close: "Close image",
    sample: "Sample information",
    noTransactions: "Demo website · no orders, payments or bookings",
    previewKicker: "BlueMind Web Service · 5,000 SEK demo",
    previewModel: "Choose a website concept",
    previewDevice: "Preview size",
    desktop: "Desktop",
    tablet: "Tablet",
    mobile: "Mobile",
    fullscreen: "Open fullscreen",
    exitFullscreen: "Exit fullscreen",
    closePreview: "Close preview",
    modelNames: { restaurant: "Restaurant", cafe: "Café", studio: "Photography studio", services: "Service company" },
  },
  sv: {
    nav: { home: "Hem", menu: "Meny", about: "Om oss", gallery: "Galleri", contact: "Kontakt" },
    menuCategories: { pizza: "Pizza", pasta: "Pasta", grill: "Grill", salads: "Sallader", desserts: "Desserter", drinks: "Drycker" },
    demoLabel: "BlueMind showcase-demo",
    back: "Till priserna",
    menuCta: "Se menyn",
    explore: "Utforska restaurangen",
    formName: "Ditt namn",
    formEmail: "E-postadress",
    formMessage: "Ditt meddelande",
    formSend: "Skicka ett demomeddelande",
    formSuccess: "Tack. Detta är en demo-bekräftelse; inget skickades eller sparades.",
    close: "Stäng bilden",
    sample: "Exempelinformation",
    noTransactions: "Demowebbplats · inga beställningar, betalningar eller bokningar",
    previewKicker: "BlueMind Web Service · demo för 5 000 SEK",
    previewModel: "Välj webbplatskoncept",
    previewDevice: "Förhandsvisning",
    desktop: "Dator",
    tablet: "Surfplatta",
    mobile: "Mobil",
    fullscreen: "Öppna helskärm",
    exitFullscreen: "Stäng helskärm",
    closePreview: "Stäng förhandsvisning",
    modelNames: { restaurant: "Restaurang", cafe: "Kafé", studio: "Fotostudio", services: "Tjänsteföretag" },
  },
  ar: {
    nav: { home: "الرئيسية", menu: "قائمة الطعام", about: "من نحن", gallery: "معرض الصور", contact: "تواصل معنا" },
    menuCategories: { pizza: "البيتزا", pasta: "الباستا", grill: "المشاوي", salads: "السلطات", desserts: "الحلويات", drinks: "المشروبات" },
    demoLabel: "نموذج عرض من BlueMind",
    back: "العودة إلى الأسعار",
    menuCta: "شاهد المينيو",
    explore: "استكشف المطعم",
    formName: "اسمك",
    formEmail: "البريد الإلكتروني",
    formMessage: "رسالتك",
    formSend: "إرسال رسالة تجريبية",
    formSuccess: "شكرًا. هذه رسالة نجاح تجريبية، ولم يتم إرسال أو تخزين أي شيء.",
    close: "إغلاق الصورة",
    sample: "بيانات تجريبية",
    noTransactions: "موقع تجريبي · لا توجد طلبات أو دفعات أو حجوزات",
    previewKicker: "BlueMind Web Service · نموذج 5,000 كرون",
    previewModel: "اختر نموذج الموقع",
    previewDevice: "حجم المعاينة",
    desktop: "كمبيوتر",
    tablet: "تابلت",
    mobile: "جوال",
    fullscreen: "فتح ملء الشاشة",
    exitFullscreen: "إغلاق ملء الشاشة",
    closePreview: "إغلاق المعاينة",
    modelNames: { restaurant: "مطعم", cafe: "كافيه", studio: "استوديو تصوير", services: "شركة خدمات" },
  },
};

type Dish = { id: string; category: MenuCategory; name: string; description: string; price: number; image: string; alt: string };
type GalleryImage = { src: string; alt: string };
type VariantContent = {
  name: string;
  descriptor: string;
  description: string;
  navMenu: string;
  heroTitle: string;
  heroBody: string;
  heroImage: string;
  heroAlt: string;
  featured: string;
  featuredBody: string;
  menuTitle: string;
  menuBody: string;
  aboutTitle: string;
  aboutBody: string;
  aboutImage: string;
  aboutAlt: string;
  galleryTitle: string;
  galleryBody: string;
  contactTitle: string;
  contactBody: string;
  footer: string;
  orderNote: string;
  categoryLabels: Record<MenuCategory, string>;
  dishes: Dish[];
  gallery: GalleryImage[];
};

const restaurantDishes: Dish[] = [
  { id: "margherita", category: "pizza", name: "Margherita al fuoco", description: "Tomato, fior di latte and basil", price: 145, image: "/images/portfolio/pizza.webp", alt: "Margherita pizza" },
  { id: "nduja", category: "pizza", name: "Nduja and roasted pepper", description: "Spicy nduja, pepper and smoked cheese", price: 168, image: "/images/portfolio/pizza-two.webp", alt: "Pizza with roasted peppers" },
  { id: "tagliatelle", category: "pasta", name: "Tagliatelle al limone", description: "Lemon, pecorino and basil", price: 185, image: "/images/portfolio/pasta.webp", alt: "Fresh pasta in a bowl" },
  { id: "pesto", category: "pasta", name: "Pesto verde", description: "Basil, pine nut and aged cheese", price: 165, image: "/images/portfolio/pesto.webp", alt: "Pesto pasta" },
  { id: "bavette", category: "grill", name: "Rosemary bavette", description: "Charred beef, salsa verde and fries", price: 245, image: "/images/portfolio/steak.webp", alt: "Grilled steak" },
  { id: "seabass", category: "grill", name: "Charred sea bass", description: "Citrus butter and seasonal greens", price: 225, image: "/images/portfolio/grilled-fish.webp", alt: "Grilled fish with lemon" },
  { id: "house-salad", category: "salads", name: "Sera house salad", description: "Fennel, orange and olive", price: 125, image: "/images/portfolio/salad.webp", alt: "Seasonal salad" },
  { id: "warm-soup", category: "salads", name: "Roasted tomato soup", description: "Basil oil, sourdough and whipped ricotta", price: 110, image: "/images/portfolio/soup.webp", alt: "Tomato soup" },
  { id: "tiramisu", category: "desserts", name: "Tiramisu", description: "Espresso, mascarpone and cocoa", price: 95, image: "/images/portfolio/dessert.webp", alt: "Tiramisu dessert" },
  { id: "lemon-cake", category: "desserts", name: "Lemon olive-oil cake", description: "Citrus curd and soft cream", price: 88, image: "/images/portfolio/cake.webp", alt: "Lemon cake" },
  { id: "spritz", category: "drinks", name: "Citrus spritz", description: "Blood orange, soda and herbs", price: 72, image: "/images/portfolio/drinks.webp", alt: "Citrus drink" },
  { id: "espresso", category: "drinks", name: "Sera espresso", description: "A short, rich roast to finish", price: 42, image: "/images/portfolio/coffee.webp", alt: "Espresso coffee" },
];

const variantContent: Record<DemoVariant, VariantContent> = {
  restaurant: {
    name: "SERA", descriptor: "Seasonal kitchen · Demo concept", description: "A warm restaurant website concept for a seasonal kitchen.", navMenu: "Menu", heroTitle: "A little Italy. A good evening.", heroBody: "Fresh pasta, wood-fired pizza and a neighbourhood table worth returning to.", heroImage: "/images/portfolio/hero-table.webp", heroAlt: "A table filled with several restaurant dishes", featured: "A few favourites", featuredBody: "A focused menu makes the next choice feel easy.", menuTitle: "The menu", menuBody: "Pizza, pasta, fire-grilled plates and small seasonal treats.", aboutTitle: "Food made for lingering.", aboutBody: "SERA is a fictional restaurant concept built to show how a small hospitality business can share its food, atmosphere and practical details in one clear place. Everything here is sample content for the demo.", aboutImage: "/images/portfolio/kitchen.webp", aboutAlt: "Restaurant kitchen with prepared ingredients", galleryTitle: "The room, the table, the details.", galleryBody: "A visual gallery gives guests a quick feeling for the place before they visit.", contactTitle: "Come by for dinner.", contactBody: "These details are examples for the demo website and do not represent a real restaurant.", footer: "A five-page restaurant concept made for the BlueMind Showcase Website package.", orderNote: "The menu is for viewing only. No purchase or reservation is available in this package demo.", categoryLabels: { pizza: "Pizza", pasta: "Pasta", grill: "Grill", salads: "Salads", desserts: "Desserts", drinks: "Drinks" }, dishes: restaurantDishes,
    gallery: [{ src: "/images/portfolio/hero-table.webp", alt: "Restaurant table with several dishes" }, { src: "/images/portfolio/restaurant.webp", alt: "Restaurant dining room" }, { src: "/images/portfolio/kitchen.webp", alt: "Restaurant kitchen" }, { src: "/images/portfolio/pizza.webp", alt: "Fresh pizza" }, { src: "/images/portfolio/dessert.webp", alt: "Dessert plate" }, { src: "/images/portfolio/drinks.webp", alt: "Drinks on a table" }],
  },
  cafe: {
    name: "MILO", descriptor: "Coffee, pastry · Demo concept", description: "A bright café website concept for coffee, brunch and slow mornings.", navMenu: "Menu", heroTitle: "Good coffee. Longer mornings.", heroBody: "A friendly café concept for fresh bakes, small plates and coffee worth crossing town for.", heroImage: "/images/portfolio/drinks.webp", heroAlt: "Coffee and drinks ready on a café table", featured: "Made fresh today", featuredBody: "Small details, clear choices and a menu that feels easy to browse.", menuTitle: "MILO menu", menuBody: "Coffee, pastries, brunch plates, salads and something sweet.", aboutTitle: "A table for your everyday pause.", aboutBody: "MILO is a fictional neighbourhood café concept. This sample site shows how a café can present its menu, atmosphere and practical details without adding online ordering or reservations.", aboutImage: "/images/portfolio/interior.webp", aboutAlt: "Bright café interior", galleryTitle: "A bright corner of the day.", galleryBody: "Show the room, the cups and the small moments that make a café feel familiar.", contactTitle: "Find your next coffee.", contactBody: "The address, phone number and opening hours below are fictional demo details.", footer: "A five-page café concept made for the BlueMind Showcase Website package.", orderNote: "This café menu is for viewing only. Online ordering and reservations are not part of this package demo.", categoryLabels: { pizza: "Pastries", pasta: "Coffee", grill: "Brunch", salads: "Salads", desserts: "Sweets", drinks: "Drinks" },
    dishes: restaurantDishes.map((dish, index) => ({ ...dish, id: `cafe-${dish.id}`, name: ["Tomato focaccia", "Morning tartine", "Flat white", "Citrus cold brew", "MILO brunch plate", "Baked eggs", "Green market salad", "Tomato soup", "Cardamom bun", "Lemon cake", "Iced berry tea", "Oat cappuccino"][index], description: ["Olive oil, herbs and sea salt", "Sourdough, egg and greens", "Silky milk and a double roast", "Orange, coffee and ice", "Eggs, toast and seasonal greens", "Tomato, herbs and toasted bread", "Fennel, citrus and olive", "Roasted tomato and basil", "Butter, spice and sugar", "Citrus curd and soft cream", "Berry, tea and mint", "Oat milk and a rich espresso"][index] })),
    gallery: [{ src: "/images/portfolio/drinks.webp", alt: "Coffee and drinks on a café table" }, { src: "/images/portfolio/interior.webp", alt: "Bright café interior" }, { src: "/images/portfolio/dessert.webp", alt: "Fresh pastry" }, { src: "/images/portfolio/table.webp", alt: "Brunch table" }, { src: "/images/portfolio/salad.webp", alt: "Café salad" }, { src: "/images/portfolio/coffee.webp", alt: "Coffee cup" }],
  },
  studio: {
    name: "NORTHLIGHT", descriptor: "Photography studio · Demo concept", description: "A calm portfolio website concept for a photography studio.", navMenu: "Portfolio", heroTitle: "Images with room to breathe.", heroBody: "A focused studio website for portraits, brands, interiors and the stories behind each frame.", heroImage: "/images/portfolio/objects.webp", heroAlt: "Photography studio objects and camera details", featured: "Selected work", featuredBody: "A flexible portfolio makes the right projects easy to find.", menuTitle: "The portfolio", menuBody: "Portraits, brands, editorial work, weddings, products and motion.", aboutTitle: "Quiet direction. Clear images.", aboutBody: "NORTHLIGHT is a fictional photography studio concept. The five-page demo shows a simple way to introduce a creative practice, its work and its contact details.", aboutImage: "/images/portfolio/workspace.webp", aboutAlt: "Photography workspace", galleryTitle: "A portfolio in frames.", galleryBody: "Use a visual gallery to let the work lead while keeping the studio story close by.", contactTitle: "Start with a frame.", contactBody: "These contact details are fictional and included only to demonstrate the template.", footer: "A five-page photography studio concept made for the BlueMind Showcase Website package.", orderNote: "This portfolio is for viewing only. Booking and payments are not part of this package demo.", categoryLabels: { pizza: "Portraits", pasta: "Brands", grill: "Editorial", salads: "Weddings", desserts: "Products", drinks: "Motion" },
    dishes: [["objects", "Portrait direction", "Natural portraits with a quiet, editorial feel"], ["architecture", "Brand stories", "Images for teams, spaces and thoughtful products"], ["interior", "Interior light", "Rooms photographed with shape, texture and air"], ["office", "Editorial set", "A considered visual language for a campaign"], ["workspace", "Wedding moments", "Honest details from the day as it unfolds"], ["house", "Product frames", "Clean product images with tactile detail"], ["forest", "Outdoor portraits", "Soft light and open space for a personal story"], ["coast", "Travel editorial", "A location-led series with a sense of place"], ["lake", "Campaign stills", "A calm collection built around one idea"], ["alpine", "Motion study", "A flexible visual system for moving image"], ["living-room", "Home story", "Warm interiors with natural composition"], ["sofa", "Material study", "Close details for a tactile brand world"]].map(([image, name, description], index) => ({ id: `studio-${index}`, category: (["pizza", "pasta", "grill", "salads", "desserts", "drinks"] as MenuCategory[])[index % 6], name, description, price: 1, image: `/images/portfolio/${image}.webp`, alt: name })),
    gallery: [{ src: "/images/portfolio/objects.webp", alt: "Camera and studio objects" }, { src: "/images/portfolio/architecture.webp", alt: "Editorial architecture" }, { src: "/images/portfolio/interior.webp", alt: "Interior photography" }, { src: "/images/portfolio/forest.webp", alt: "Outdoor portrait setting" }, { src: "/images/portfolio/coast.webp", alt: "Coastal editorial" }, { src: "/images/portfolio/workspace.webp", alt: "Studio workspace" }],
  },
  services: {
    name: "FIELDWORK", descriptor: "Creative services · Demo concept", description: "A clear service website concept for a small creative team.", navMenu: "Services", heroTitle: "Good work starts with a clear next step.", heroBody: "A practical five-page website for a team that wants to explain its services and make contact easy.", heroImage: "/images/portfolio/workspace.webp", heroAlt: "Creative team workspace", featured: "What we do", featuredBody: "Organize your offer into clear, approachable service areas.", menuTitle: "Our services", menuBody: "Strategy, design, development, support, content and launch planning.", aboutTitle: "A small team with a useful point of view.", aboutBody: "FIELDWORK is a fictional service company concept built to demonstrate a concise, confident website for a small team. The cards below are sample content, not claims about a real company.", aboutImage: "/images/portfolio/office.webp", aboutAlt: "Bright creative office", galleryTitle: "The work behind the work.", galleryBody: "Use imagery to show the people, spaces and process that support your services.", contactTitle: "Tell us what you are building.", contactBody: "These details are fictional demo information and are not connected to a real service company.", footer: "A five-page service company concept made for the BlueMind Showcase Website package.", orderNote: "These service cards are for viewing only. No purchase, booking or payment is available in this package demo.", categoryLabels: { pizza: "Strategy", pasta: "Design", grill: "Development", salads: "Content", desserts: "Support", drinks: "Launch" },
    dishes: [["office", "Project strategy", "Turn a broad idea into a focused direction"], ["workspace", "Brand direction", "Build a visual language that feels like you"], ["architecture", "Web design", "Create pages that make the next step clear"], ["interior", "Content planning", "Give every section a useful job"], ["kitchen", "Ongoing support", "Keep the work tidy after launch"], ["house", "Launch planning", "Bring the final details together with care"], ["objects", "Research sprint", "Find the useful signal in a complex brief"], ["forest", "Campaign system", "Make one idea work across many touchpoints"], ["coast", "Editorial planning", "Shape stories that are easy to follow"], ["lake", "Prototype review", "Test the route before the build begins"], ["alpine", "Team workshop", "A shared session for better decisions"], ["living-room", "Service toolkit", "Practical assets your team can keep using"]].map(([image, name, description], index) => ({ id: `services-${index}`, category: (["pizza", "pasta", "grill", "salads", "desserts", "drinks"] as MenuCategory[])[index % 6], name, description, price: 1, image: `/images/portfolio/${image}.webp`, alt: name })),
    gallery: [{ src: "/images/portfolio/workspace.webp", alt: "Creative workspace" }, { src: "/images/portfolio/office.webp", alt: "Bright office" }, { src: "/images/portfolio/architecture.webp", alt: "Service project detail" }, { src: "/images/portfolio/objects.webp", alt: "Creative tools" }, { src: "/images/portfolio/interior.webp", alt: "Meeting space" }, { src: "/images/portfolio/kitchen.webp", alt: "Work in progress" }],
  },
};

function sectionFromPath(pathname: string): Section {
  const last = pathname.split("/").filter(Boolean).at(-1);
  return last && last in sectionPaths ? last as Section : "home";
}

function formatPrice(price: number, variant: DemoVariant) {
  return variant === "studio" || variant === "services" ? "View project" : `${price.toLocaleString("sv-SE")} kr`;
}

function variantType(variant: VariantContent): DemoVariant {
  if (variant.name === "SERA") return "restaurant";
  if (variant.name === "MILO") return "cafe";
  if (variant.name === "NORTHLIGHT") return "studio";
  return "services";
}

export default function RestaurantDemo() {
  const { locale } = useLocalization();
  const pathname = usePathname();
  const text = copy[locale];
  const currentSection = sectionFromPath(pathname);
  const [demoType, setDemoType] = useState<DemoVariant>("restaurant");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [fullscreen, setFullscreen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<MenuCategory>("pizza");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [formSent, setFormSent] = useState(false);
  const variant = variantContent[demoType];
  const navText = { ...text.nav, menu: variant.navMenu };

  useEffect(() => {
    setMenuOpen(false);
    setLightbox(null);
    setFormSent(false);
  }, [pathname, demoType]);

  useEffect(() => {
    setCategory("pizza");
  }, [demoType]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [fullscreen]);

  const filteredDishes = useMemo(() => variant.dishes.filter(dish => dish.category === category), [category, variant]);

  function submitDemoForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormSent(true);
  }

  return (
    <div className={`${styles.previewStage} ${fullscreen ? styles.previewFullscreen : ""}`} dir={locale === "ar" ? "rtl" : "ltr"}>
      <PreviewToolbar text={text} demoType={demoType} device={device} variant={variant} fullscreen={fullscreen} onDemoTypeChange={setDemoType} onDeviceChange={setDevice} onFullscreenChange={setFullscreen} />
      <div className={styles.previewViewport} data-device={device} style={{ width: device === "mobile" ? "min(100%, 420px)" : device === "tablet" ? "min(100%, 900px)" : "100%", maxWidth: "none" }}>
        <div className={styles.demo}>
          <div className={styles.demoNotice}><span>{text.demoLabel}</span><span>{text.noTransactions}</span></div>
          <header className={styles.header}>
            <Link href={sectionPaths.home} className={styles.brand} aria-label={`${variant.name} home`}>
              <strong>{variant.name}</strong><span>{variant.descriptor}</span>
            </Link>
            <button type="button" className={styles.menuToggle} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} data-no-translate onClick={() => setMenuOpen(open => !open)}><span /><span /><span /></button>
            <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Demo website navigation">
              {(Object.keys(sectionPaths) as Section[]).map(section => <Link key={section} className={currentSection === section ? styles.activeNav : ""} href={sectionPaths[section]} onClick={() => setMenuOpen(false)}>{navText[section]}</Link>)}
            </nav>
            <Link className={styles.backLink} href="/quote">{text.back}</Link>
          </header>

          <main className={styles.main}>
            {currentSection === "home" && <HomePage text={text} variant={variant} navText={navText} />}
            {currentSection === "menu" && <MenuPage text={text} variant={variant} category={category} setCategory={setCategory} dishes={filteredDishes} />}
            {currentSection === "about" && <AboutPage text={text} variant={variant} />}
            {currentSection === "gallery" && <GalleryPage text={text} variant={variant} lightbox={lightbox} setLightbox={setLightbox} />}
            {currentSection === "contact" && <ContactPage text={text} variant={variant} formSent={formSent} submitDemoForm={submitDemoForm} />}
          </main>

          <footer className={styles.footer}>
            <div><strong>{variant.name}</strong><p>{variant.footer}</p></div>
            <nav aria-label="Footer navigation">{(Object.keys(sectionPaths) as Section[]).map(section => <Link key={section} href={sectionPaths[section]}>{navText[section]}</Link>)}</nav>
            <Link className={styles.footerBack} href="/quote">{text.back}</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}

function PreviewToolbar({ text, demoType, device, variant, fullscreen, onDemoTypeChange, onDeviceChange, onFullscreenChange }: { text: (typeof copy)[Locale]; demoType: DemoVariant; device: PreviewDevice; variant: VariantContent; fullscreen: boolean; onDemoTypeChange: (value: DemoVariant) => void; onDeviceChange: (value: PreviewDevice) => void; onFullscreenChange: (value: boolean) => void }) {
  const models: DemoVariant[] = ["restaurant", "cafe", "studio", "services"];
  const devices: { id: PreviewDevice; label: string; icon: string }[] = [
    { id: "desktop", label: text.desktop, icon: "▣" },
    { id: "tablet", label: text.tablet, icon: "▤" },
    { id: "mobile", label: text.mobile, icon: "▯" },
  ];
  return (
    <div className={styles.previewToolbar} aria-label="BlueMind demo controls">
      <div className={styles.previewMeta}><span className={styles.previewKicker}>{text.previewKicker}</span><strong>{variant.name}</strong><span>{variant.descriptor}</span><p>{variant.description}</p></div>
      <div className={styles.previewControls}>
        <div className={`${styles.previewGroup} ${styles.previewModelGroup}`} role="group" aria-label={text.previewModel}>{models.map(model => <button key={model} type="button" className={demoType === model ? styles.previewSelected : ""} aria-pressed={demoType === model} onClick={() => onDemoTypeChange(model)}>{text.modelNames[model]}</button>)}</div>
        <div className={`${styles.previewGroup} ${styles.previewDeviceGroup}`} role="group" aria-label={text.previewDevice}>{devices.map(item => <button key={item.id} type="button" className={device === item.id ? styles.previewSelected : ""} aria-pressed={device === item.id} onClick={() => onDeviceChange(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</div>
        <button type="button" className={styles.previewUtility} aria-pressed={fullscreen} aria-label={fullscreen ? text.exitFullscreen : text.fullscreen} data-no-translate onClick={() => onFullscreenChange(!fullscreen)}>{fullscreen ? "⤢" : "⛶"}</button>
        <Link className={styles.previewClose} href="/quote">× <span>{text.closePreview}</span></Link>
      </div>
    </div>
  );
}

function HomePage({ text, variant, navText }: { text: (typeof copy)[Locale]; variant: VariantContent; navText: Record<Section, string> }) {
  return <>
    <section className={styles.hero}>
      <div className={styles.heroCopy}><span className={styles.eyebrow}>{variant.descriptor}</span><h1>{variant.heroTitle}</h1><p>{variant.heroBody}</p><div className={styles.heroActions}><Link className={styles.primaryButton} href={sectionPaths.menu}>{text.menuCta}</Link><Link className={styles.secondaryButton} href={sectionPaths.contact}>{text.explore}</Link></div></div>
      <div className={styles.heroImage}><img src={variant.heroImage} alt={variant.heroAlt} /><span>{variant.name} / 01</span></div>
    </section>
    <section className={styles.section} aria-labelledby="featured-title"><div className={styles.sectionHeading}><div><span className={styles.eyebrow}>{variant.name} / {navText.menu}</span><h2 id="featured-title">{variant.featured}</h2></div><p>{variant.featuredBody}</p></div><DishGrid dishes={variant.dishes.slice(0, 4)} variant={variantType(variant)} /></section>
    <section className={styles.callout}><span className={styles.eyebrow}>{variant.name} / {navText.menu}</span><h2>{variant.menuTitle}</h2><p>{variant.orderNote}</p><Link className={styles.textLink} href={sectionPaths.menu}>{text.menuCta} →</Link></section>
  </>;
}

function MenuPage({ text, variant, category, setCategory, dishes: visibleDishes }: { text: (typeof copy)[Locale]; variant: VariantContent; category: MenuCategory; setCategory: (category: MenuCategory) => void; dishes: Dish[] }) {
  return <section className={styles.pageSection}><div className={styles.pageIntro}><span className={styles.eyebrow}>{variant.name} / {variant.navMenu}</span><h1>{variant.menuTitle}</h1><p>{variant.menuBody}</p></div><div className={styles.categoryTabs} role="tablist" aria-label={variant.menuTitle}>{(Object.keys(variant.categoryLabels) as MenuCategory[]).map(item => <button type="button" role="tab" aria-selected={category === item} className={category === item ? styles.selectedTab : ""} key={item} onClick={() => setCategory(item)}>{variant.categoryLabels[item]}</button>)}</div><DishGrid dishes={visibleDishes} variant={variantType(variant)} /><p className={styles.disclosure}>{variant.orderNote}</p></section>;
}

function DishGrid({ dishes, variant }: { dishes: Dish[]; variant: DemoVariant }) {
  return <div className={styles.dishGrid}>{dishes.map(dish => <article className={styles.dishCard} key={dish.id}><div className={styles.dishImage}><img src={dish.image} alt={dish.alt} /></div><div className={styles.dishContent}><div><h3>{dish.name}</h3><p>{dish.description}</p></div><strong>{formatPrice(dish.price, variant)}</strong></div></article>)}</div>;
}

function AboutPage({ text, variant }: { text: (typeof copy)[Locale]; variant: VariantContent }) {
  return <section className={styles.pageSection}><div className={styles.pageIntro}><span className={styles.eyebrow}>{variant.name} / {text.nav.about}</span><h1>{variant.aboutTitle}</h1><p>{variant.aboutBody}</p></div><div className={styles.aboutGrid}><img src={variant.aboutImage} alt={variant.aboutAlt} /><div className={styles.aboutPanel}><span className={styles.eyebrow}>A DEMO STORY</span><h2>{variant.featured}</h2><p>{variant.featuredBody} The content is intentionally fictional so this preview can be explored safely.</p><div className={styles.aboutFacts}><span><strong>01</strong>Clear first impression</span><span><strong>02</strong>Easy to browse</span><span><strong>03</strong>Ready for your content</span></div></div></div></section>;
}

function GalleryPage({ text, variant, lightbox, setLightbox }: { text: (typeof copy)[Locale]; variant: VariantContent; lightbox: number | null; setLightbox: (index: number | null) => void }) {
  return <section className={styles.pageSection}><div className={styles.pageIntro}><span className={styles.eyebrow}>{variant.name} / {text.nav.gallery}</span><h1>{variant.galleryTitle}</h1><p>{variant.galleryBody}</p></div><div className={styles.galleryGrid}>{variant.gallery.map((image, index) => <button type="button" className={styles.galleryItem} key={image.src} onClick={() => setLightbox(index)}><img src={image.src} alt={image.alt} /><span>View image</span></button>)}</div>{lightbox !== null && <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={variant.gallery[lightbox].alt} onClick={() => setLightbox(null)}><button type="button" aria-label={text.close} onClick={() => setLightbox(null)}>×</button><img src={variant.gallery[lightbox].src} alt={variant.gallery[lightbox].alt} onClick={event => event.stopPropagation()} /></div>}</section>;
}

function ContactPage({ text, variant, formSent, submitDemoForm }: { text: (typeof copy)[Locale]; variant: VariantContent; formSent: boolean; submitDemoForm: (event: FormEvent<HTMLFormElement>) => void }) {
  return <section className={styles.pageSection}><div className={styles.pageIntro}><span className={styles.eyebrow}>{variant.name} / {text.nav.contact}</span><h1>{variant.contactTitle}</h1><p>{variant.contactBody}</p></div><div className={styles.contactGrid}><div className={styles.contactDetails}><InfoBlock label={text.nav.about} value="A fictional demo business" /><InfoBlock label="Address" value="Demo Street 12\n111 22 Stockholm" /><InfoBlock label="Phone" value="+46 8 555 01 01" /><InfoBlock label="Opening hours" value="Tue–Sat · 17:00–23:00" /><span className={styles.sampleNote}>{text.sample}</span></div><form className={styles.contactForm} onSubmit={submitDemoForm}><label>{text.formName}<input required name="name" placeholder={text.formName} /></label><label>{text.formEmail}<input required type="email" name="email" placeholder={text.formEmail} /></label><label>{text.formMessage}<textarea required name="message" rows={5} placeholder={text.formMessage} /></label><button type="submit" className={styles.primaryButton}>{text.formSend}</button>{formSent && <p className={styles.formSuccess} role="status">{text.formSuccess}</p>}</form></div></section>;
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return <div className={styles.infoBlock}><span>{label}</span><strong>{value}</strong></div>;
}
