export type DemoAction =
  | "cart"
  | "booking"
  | "quote"
  | "viewing"
  | "waitlist"
  | "tickets"
  | "donation"
  | "ai";

export type DemoCategoryId =
  | "restaurant"
  | "cafe"
  | "salon"
  | "store"
  | "company"
  | "portfolio"
  | "product-launch"
  | "appointment"
  | "hotel"
  | "real-estate"
  | "clinic"
  | "fitness"
  | "courses"
  | "events"
  | "nonprofit"
  | "ai-platform";

export type DemoCategory = {
  id: DemoCategoryId;
  label: { en: string; ar: string; sv: string };
  brand: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  ink: string;
  surface: string;
  image: string;
  action: DemoAction;
  actionLabel: string;
  secondaryLabel?: string;
  nav: string[];
};

export const demoCategories: readonly DemoCategory[] = [
  {
    id: "restaurant",
    label: { en: "Restaurant", ar: "مطعم", sv: "Restaurang" },
    brand: "SERA",
    eyebrow: "SEASONAL KITCHEN",
    title: "A little Italy. A good evening.",
    description: "Fresh pasta, seasonal plates and a neighbourhood table worth returning to.",
    accent: "#9b4b32",
    ink: "#3f2520",
    surface: "#f7eadb",
    image: "/images/portfolio/restaurant.webp",
    action: "cart",
    actionLabel: "Order from the menu",
    secondaryLabel: "Book a table",
    nav: ["Menu", "Our story", "Visit us"],
  },
  {
    id: "cafe",
    label: { en: "Café", ar: "مقهى", sv: "Kafé" },
    brand: "DAYLIGHT",
    eyebrow: "COFFEE · BAKES · SLOW MORNINGS",
    title: "Make time for a good cup.",
    description: "Bright coffee, warm pastries and easy pickup for the days that move quickly.",
    accent: "#6d4c3d",
    ink: "#30241f",
    surface: "#f4eee8",
    image: "/images/portfolio/drinks.webp",
    action: "cart",
    actionLabel: "Order for pickup",
    secondaryLabel: "See today's specials",
    nav: ["Menu", "Pickup", "Find us"],
  },
  {
    id: "salon",
    label: { en: "Salons & beauty", ar: "صالونات وتجميل", sv: "Salonger & skönhet" },
    brand: "MUSE",
    eyebrow: "HAIR · SKIN · WELLBEING",
    title: "A little time, entirely yours.",
    description: "Thoughtful treatments and a calm space for your next reset.",
    accent: "#a05b72",
    ink: "#4e2938",
    surface: "#f6e9ed",
    image: "/images/portfolio/interior.webp",
    action: "booking",
    actionLabel: "Book an appointment",
    secondaryLabel: "Explore services",
    nav: ["Services", "Journal", "The studio"],
  },
  {
    id: "store",
    label: { en: "Online stores", ar: "متاجر إلكترونية", sv: "Webbutiker" },
    brand: "FOLIO",
    eyebrow: "OBJECTS FOR EVERYDAY",
    title: "Find your next chapter.",
    description: "A considered store with simple discovery, product details and a clear checkout.",
    accent: "#3468bc",
    ink: "#152b4e",
    surface: "#edf2fb",
    image: "/images/portfolio/objects.webp",
    action: "cart",
    actionLabel: "Browse the collection",
    secondaryLabel: "View new arrivals",
    nav: ["Shop", "New arrivals", "About"],
  },
  {
    id: "company",
    label: { en: "Company websites", ar: "مواقع شركات", sv: "Företagswebbplatser" },
    brand: "MERIDIAN",
    eyebrow: "STRATEGY · TECHNOLOGY · IMPACT",
    title: "A clearer way forward.",
    description: "Independent thinking and connected expertise for teams building what is next.",
    accent: "#315f7a",
    ink: "#193343",
    surface: "#eaf1f3",
    image: "/images/portfolio/architecture.webp",
    action: "quote",
    actionLabel: "Request a conversation",
    secondaryLabel: "Explore capabilities",
    nav: ["Capabilities", "Approach", "Insights"],
  },
  {
    id: "portfolio",
    label: { en: "Portfolios", ar: "عرض أعمال", sv: "Portfolior" },
    brand: "FORMA STUDIO",
    eyebrow: "SELECTED WORK / 2026",
    title: "Spaces with a story.",
    description: "An editorial portfolio for a studio that turns places into experiences.",
    accent: "#66586e",
    ink: "#332b3b",
    surface: "#f0edf3",
    image: "/images/portfolio/living-room.webp",
    action: "quote",
    actionLabel: "Start a project",
    secondaryLabel: "View selected work",
    nav: ["Work", "Studio", "Contact"],
  },
  {
    id: "product-launch",
    label: { en: "Product launches", ar: "إطلاق منتجات", sv: "Produktlanseringar" },
    brand: "NORTH / 01",
    eyebrow: "A NEW OBJECT FOR THE EVERYDAY",
    title: "Designed to move with you.",
    description: "A focused launch page that explains the product, builds interest and collects early access.",
    accent: "#486f69",
    ink: "#213c39",
    surface: "#e7f0ed",
    image: "/images/portfolio/chair.webp",
    action: "waitlist",
    actionLabel: "Get early access",
    secondaryLabel: "See the details",
    nav: ["The product", "Details", "Early access"],
  },
  {
    id: "appointment",
    label: { en: "Appointment booking", ar: "حجز مواعيد", sv: "Tidsbokning" },
    brand: "LUMA",
    eyebrow: "A SIMPLE WAY TO MAKE TIME",
    title: "Choose a time that works.",
    description: "A booking experience that makes services, availability and confirmation easy to understand.",
    accent: "#3f7e91",
    ink: "#1e4653",
    surface: "#e7f4f6",
    image: "/images/portfolio/workspace.webp",
    action: "booking",
    actionLabel: "Find a time",
    secondaryLabel: "View services",
    nav: ["Services", "Availability", "About"],
  },
  {
    id: "hotel",
    label: { en: "Hotels & stays", ar: "فنادق وإقامات", sv: "Hotell & boenden" },
    brand: "NORTH STAY",
    eyebrow: "SLOW DOWN SOMEWHERE BEAUTIFUL",
    title: "Somewhere to slow down.",
    description: "A calm stay finder with room details, dates and a reservation journey made for mobile too.",
    accent: "#3e7380",
    ink: "#21444b",
    surface: "#e8f3f4",
    image: "/images/portfolio/alpine.webp",
    action: "booking",
    actionLabel: "Find your stay",
    secondaryLabel: "Explore the rooms",
    nav: ["Rooms", "The house", "Journal"],
  },
  {
    id: "real-estate",
    label: { en: "Real estate", ar: "مواقع عقارات", sv: "Fastigheter" },
    brand: "HAVEN",
    eyebrow: "A BETTER WAY HOME",
    title: "Find a home. Feel at home.",
    description: "Searchable listings, honest details and a direct path to request a private viewing.",
    accent: "#417468",
    ink: "#23483e",
    surface: "#eaf3ed",
    image: "/images/portfolio/house.webp",
    action: "viewing",
    actionLabel: "Request a viewing",
    secondaryLabel: "Browse homes",
    nav: ["Homes", "Neighbourhoods", "About"],
  },
  {
    id: "clinic",
    label: { en: "Clinics", ar: "مواقع عيادات", sv: "Kliniker" },
    brand: "AURELIA",
    eyebrow: "CARE THAT MEETS YOU WHERE YOU ARE",
    title: "Your wellbeing comes first.",
    description: "Clear care information, trusted specialists and a reassuring appointment flow.",
    accent: "#3e7c88",
    ink: "#21454c",
    surface: "#e8f4f5",
    image: "/images/portfolio/forest.webp",
    action: "booking",
    actionLabel: "Book a consultation",
    secondaryLabel: "Meet the team",
    nav: ["Care", "Specialists", "Patient guide"],
  },
  {
    id: "fitness",
    label: { en: "Fitness clubs", ar: "نوادٍ رياضية", sv: "Träningsklubbar" },
    brand: "KIN / CLUB",
    eyebrow: "MOVE WITH INTENTION",
    title: "A stronger week starts here.",
    description: "Classes, coaches and membership options in a site that keeps momentum visible.",
    accent: "#c46136",
    ink: "#4a271d",
    surface: "#f7e9de",
    image: "/images/portfolio/coast.webp",
    action: "booking",
    actionLabel: "Book a class",
    secondaryLabel: "View membership",
    nav: ["Classes", "Coaches", "Membership"],
  },
  {
    id: "courses",
    label: { en: "Courses & education", ar: "دورات وتعليم", sv: "Kurser & utbildning" },
    brand: "FIELD NOTES",
    eyebrow: "LEARN SOMETHING THAT LASTS",
    title: "Make room for a new skill.",
    description: "A course platform that turns a catalogue of learning into a clear next step.",
    accent: "#7359a4",
    ink: "#3d2b61",
    surface: "#f0ebf8",
    image: "/images/portfolio/workspace.webp",
    action: "quote",
    actionLabel: "Explore the courses",
    secondaryLabel: "Meet the teachers",
    nav: ["Courses", "How it works", "Stories"],
  },
  {
    id: "events",
    label: { en: "Events & tickets", ar: "فعاليات وتذاكر", sv: "Evenemang & biljetter" },
    brand: "OPEN AIR",
    eyebrow: "MUSIC · FOOD · LATE SUMMER",
    title: "Meet us under the open sky.",
    description: "A lively event site that makes the lineup, practical details and ticket purchase feel simple.",
    accent: "#d46a36",
    ink: "#54291a",
    surface: "#fff0e4",
    image: "/images/portfolio/coast.webp",
    action: "tickets",
    actionLabel: "Choose tickets",
    secondaryLabel: "See the lineup",
    nav: ["Lineup", "Details", "Tickets"],
  },
  {
    id: "nonprofit",
    label: { en: "Nonprofits & initiatives", ar: "جمعيات ومبادرات", sv: "Föreningar & initiativ" },
    brand: "COMMON GROUND",
    eyebrow: "SMALL ACTIONS. SHARED FUTURES.",
    title: "There is room for everyone.",
    description: "A warm campaign site that explains the mission, shares stories and turns care into action.",
    accent: "#43816a",
    ink: "#234a3a",
    surface: "#e9f4ec",
    image: "/images/portfolio/forest.webp",
    action: "donation",
    actionLabel: "Support the work",
    secondaryLabel: "Read our stories",
    nav: ["Our work", "Stories", "Get involved"],
  },
  {
    id: "ai-platform",
    label: { en: "AI websites & platforms", ar: "مواقع ومنصات ذكاء اصطناعي", sv: "AI-webbplatser & plattformar" },
    brand: "ASTER",
    eyebrow: "A CLEARER FIRST DRAFT",
    title: "Space for your ideas.",
    description: "A guided AI product experience that turns a loose idea into a useful project brief.",
    accent: "#74579a",
    ink: "#392b52",
    surface: "#f0eafa",
    image: "/images/portfolio/workspace.webp",
    action: "ai",
    actionLabel: "Shape an idea",
    secondaryLabel: "Explore the workflow",
    nav: ["How it works", "Examples", "About"],
  },
] as const;

export function getDemoCategory(id: DemoCategoryId) {
  return demoCategories.find((category) => category.id === id)!;
}
