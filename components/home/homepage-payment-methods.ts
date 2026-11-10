export type HomepagePaymentMethod = {
  name: string;
  asset?: string;
};

export const homepagePaymentMethods: readonly HomepagePaymentMethod[] = [
  { name: "Klarna", asset: "/images/footer/klarna.svg" },
  { name: "Swish", asset: "/images/footer/swish.svg" },
  { name: "Faktura" },
  { name: "Visa", asset: "/images/footer/visa.png" },
  { name: "Mastercard", asset: "/images/footer/mastercard.svg" },
  { name: "Google Pay", asset: "/images/footer/google-pay.svg" },
  { name: "Apple Pay", asset: "/images/footer/apple-pay.svg" },
  { name: "PayPal", asset: "/images/footer/paypal.svg" },
] as const;
