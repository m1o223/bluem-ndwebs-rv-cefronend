import { contactConfig } from "../app/contact/contact-config";

type Social = { name: string; icon: string; url: string | null };
type Legal = { label: string; href: string | null };
type Payment = { name: string; asset: string | null };
export const footerConfig = {
  brandName: "BlueMind Web Service",
  brandTagline: "Your idea. Our expertise. Built for the web.",
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
    { name: "Apple Pay", asset: "/images/footer/apple-pay.svg" }, { name: "Google Pay", asset: "/images/footer/google-pay.svg" },
    { name: "Visa", asset: "/images/footer/visa.png" }, { name: "Mastercard", asset: "/images/footer/mastercard.svg" },
  ] satisfies Payment[],
  comingSoonPayment: "Klarna",
  legalLinks: [
    { label: "Privacy Policy", href: null },
    { label: "Terms & Conditions", href: null },
    { label: "Cookie Policy", href: null },
  ] satisfies Legal[],
} as const;

