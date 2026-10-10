export const packages = [
  {
    id: "01",
    checkoutId: "showcase-website",
    title: "Showcase Website",
    price: "4,990 SEK",
    delivery: "Delivery depends on the agreed content and project scope.",
    scope: "Up to 3 pages of your choice",
    description: "A simple, professional website to show your work, products, or services.",
    features: [
      "Choose your colors and visual style.",
      "Up to 3 pages, such as Home, Services, and Contact.",
      "Show photos, information, and examples of your work.",
      "Contact form or WhatsApp contact option.",
      "Responsive layout for mobile, tablet, and computer.",
      "Basic Google-friendly setup.",
      "Help connecting your own domain.",
      "Launch Assistance - we help you publish your website and make it available online.",
      "Revisions Included - you can request changes before delivery within the agreed project scope.",
      "Best for businesses that want to be visible online without payments or orders."
    ],
    cta: "Get Started",
    popular: false,
    visibleFeatures: 6,
    vatNote: "Prices exclude VAT where VAT applies. Final VAT treatment appears on the invoice."
  },
  {
    id: "02",
    checkoutId: "business-website",
    title: "Business Website",
    price: "8,990 SEK",
    delivery: "Delivery depends on whether your project uses booking or pickup orders and the agreed scope.",
    scope: "Up to 6 pages of your choice",
    description: "A website where customers can book a time or place an order for pickup.",
    features: [
      "Everything included in Showcase Website.",
      "Up to 6 pages based on your business needs.",
      "Choose online booking or pickup orders.",
      "Let customers book appointments or order products for pickup.",
      "Manage bookings or pickup orders from a private page.",
      "Email notifications for new bookings or orders.",
      "Update services, prices, and available times.",
      "Keep customer requests organized.",
      "Mobile-friendly design.",
      "Launch Assistance - we help you publish your website and make it available online.",
      "Revisions Included - you can request changes before delivery within the agreed project scope.",
      "Includes one system: booking or pickup orders.",
      "Online payment and delivery are not included."
    ],
    cta: "Get Started",
    popular: true,
    badge: "MOST POPULAR",
    visibleFeatures: 6,
    vatNote: "Prices exclude VAT where VAT applies. Final VAT treatment appears on the invoice."
  },
  {
    id: "03",
    checkoutId: "online-store",
    title: "Online Store",
    price: "14,990 SEK",
    delivery: "Estimated delivery depends on the agreed features and project scope.",
    scope: "Up to 10 custom pages + product pages",
    description: "A complete online store where customers can shop, pay, and choose delivery.",
    features: [
      "Custom online shop design for your business.",
      "Add products with photos, descriptions, and prices.",
      "Shopping cart for multiple products.",
      "Secure online payments through supported methods.",
      "Delivery options customers can choose at checkout.",
      "Manage your store from a private page.",
      "View orders and update products.",
      "Track stock levels.",
      "Product search and categories.",
      "Discount codes for special offers.",
      "Automatic order confirmation emails for customers.",
      "Up to 10 custom pages.",
      "Product pages generated from product information.",
      "Responsive layout for mobile, tablet, and computer.",
      "Launch Assistance - we help you publish your website and make it available online.",
      "Revisions Included - you can request changes before delivery within the agreed project scope.",
      "Advanced shipping integrations, extra languages, and special features may cost extra."
    ],
    cta: "Get Started",
    popular: false,
    visibleFeatures: 6,
    vatNote: "Prices exclude VAT where VAT applies. Final VAT treatment appears on the invoice."
  }
] as const;

export const interestOptions = [...packages.map(item => item.title), "Not Sure Yet"];
export const timelineOptions = ["As soon as possible", "Within 1-2 weeks", "Within 1 month", "Flexible"];
