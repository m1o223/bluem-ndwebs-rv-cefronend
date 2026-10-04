import { contactConfig } from "../app/contact/contact-config";

type Social = { name: string; icon: string; url: string | null };
type Legal = { label: string; href: string | null };
type Payment = { name: string; asset: string | null };
export const footerConfig = {
  brandName: "BlueMind Web Service",
  brandTagline: "Your idea. Our expertise. Built for the web.",
  logo: "/icons/bluemind-512-8e7ece442cf9.png",
  contact: { ...contactConfig, approved: false },
  explore: [
    ["/", "Home"], ["/about", "About Us"], ["/services", "Services"],
    ["/how-we-work", "How We Work"], ["/#selected-work", "Website Concepts"],
    ["/quote", "Request a Quote"], ["/contact", "Contact"], ["/care", "Website Care"],
  ],
  services: [["/services", "Website Design"], ["/quote", "Business Websites"], ["/quote", "Online Stores"], ["/quote", "Custom Websites"], ["/care", "BlueMind Care"]],
  social: [
    { name: "Instagram", icon: "/images/footer/instagram.svg", url: null },
    { name: "TikTok", icon: "/images/footer/tiktok.svg", url: null },
    { name: "X", icon: "/images/footer/x.svg", url: null },
  ] satisfies Social[],
  paymentMethods: [
    { name: "Apple Pay", asset: null }, { name: "Google Pay", asset: null },
    { name: "Visa", asset: null }, { name: "Mastercard", asset: null },
    { name: "Klarna", asset: null },
  ] satisfies Payment[],
  // Payment marks stay unrendered until their use is approved. Plain names
  // communicate planned support without imitating licensed artwork.
  legalLinks: [
    { label: "Privacy Policy", href: null },
    { label: "Terms & Conditions", href: null },
    { label: "Cookie Policy", href: null },
  ] satisfies Legal[],
} as const;
