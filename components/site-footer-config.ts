import { contactConfig } from "../app/contact/contact-config";

type Social = { name: string; icon: string; url: string | null };
type Legal = { label: string; href: string | null };
type Payment = { name: string; asset: string | null; note?: string };
export const footerConfig = {
  brandName: "BlueMind Web Service",
  brandTagline: "Your idea. Our expertise. Built for the web.",
  contact: contactConfig,
  explore: [
    ["/", "Home"], ["/about", "About Us"], ["/services", "Services"],
    ["/how-we-work", "How We Work"], ["/#selected-work", "Website Concepts"], ["/faq", "FAQ"],
    ["/quote", "Request a Quote"], ["/contact", "Contact"], ["/care", "Website Care"],
  ],
  services: [["/services", "Website Design"], ["/quote", "Business Websites"], ["/quote", "Online Stores"], ["/quote", "Custom Websites"], ["/care", "BlueMind Care"]],
  social: [
    { name: "TikTok", icon: "/images/footer/tiktok.svg", url: null },
    { name: "Instagram", icon: "/images/footer/instagram.svg", url: null },
    { name: "X", icon: "/images/footer/x.svg", url: null },
  ] satisfies Social[],
  paymentMethods: [
    { name: "Klarna", asset: "/images/footer/klarna.svg" },
    { name: "Swish", asset: "/images/footer/swish.svg" },
    { name: "Faktura", asset: null },
    { name: "Visa", asset: "/images/footer/visa.png" },
    { name: "Mastercard", asset: "/images/footer/mastercard.svg" },
    { name: "Apple Pay", asset: "/images/footer/apple-pay.svg" },
    { name: "Google Pay", asset: "/images/footer/google-pay.svg" },
    { name: "PayPal", asset: "/images/footer/paypal.svg" },
    { name: "American Express", asset: "/images/footer/american-express.svg" },
    { name: "Alipay", asset: "/images/footer/alipay.svg" },
    { name: "mada", asset: "/images/footer/mada.svg" },
    { name: "Pix", asset: "/images/footer/pix.svg" },
  ] satisfies Payment[],
  legalLinks: [
    { label: "Privacy Policy", href: null },
    { label: "Terms & Conditions", href: null },
    { label: "Cookie Policy", href: null },
  ] satisfies Legal[],
} as const;
