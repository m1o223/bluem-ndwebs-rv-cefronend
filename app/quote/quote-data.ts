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
      "Your own design - choose the colors and style you like.",
      "3 pages - for example: Home, Services, Contact.",
      "Show your work with photos, information, and examples.",
      "Easy contact through a form or WhatsApp.",
      "Works on mobile, tablet, and computer.",
      "Google-friendly setup.",
      "Your own website address with domain connection help.",
      "Changes before delivery within the agreed plan.",
      "Best for businesses that want to show their work online without taking payments or orders."
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
      "Everything in Showcase Website.",
      "6 pages - choose the pages your business needs.",
      "Online booking OR pickup orders.",
      "Customers can book appointments or order products for pickup.",
      "Manage bookings or orders on your own private page.",
      "Email notifications when customers book or order.",
      "Update services, prices, and available times.",
      "Save customer requests and keep them organized.",
      "Mobile-friendly design.",
      "The customer chooses one system: online booking OR pickup orders.",
      "Online payment and delivery are not included in this package."
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
      "Your own online shop with a design made for your business.",
      "Add products with photos, descriptions, and prices.",
      "Shopping cart for multiple products.",
      "Online payments through supported secure methods.",
      "Shipping options customers can choose at checkout.",
      "Manage your store from your own private page.",
      "See orders and change products.",
      "Stock tracking to see how many items are left.",
      "Search and categories to help customers find products.",
      "Discount codes for special offers.",
      "Automatic customer order confirmation emails.",
      "Up to 10 custom pages.",
      "Product pages generated automatically from product information.",
      "Works on mobile, tablet, and computer.",
      "Advanced shipping integrations, additional languages, and special features may cost extra."
    ],
    cta: "Get Started",
    popular: false,
    visibleFeatures: 6,
    vatNote: "Prices exclude VAT where VAT applies. Final VAT treatment appears on the invoice."
  }
] as const;

export const includedFeatures = [
  {
    title: "Custom design",
    text: "Your website is designed around your idea and your project."
  },
  {
    title: "You choose the design direction",
    text: "You are involved in choosing the look and direction of your website."
  },
  {
    title: "Mobile, Tablet & Desktop",
    text: "Your website is designed to work across different screen sizes at no extra design charge."
  },
  {
    title: "Responsive Design",
    text: "The layout automatically adapts to different devices and screen sizes."
  },
  {
    title: "Basic SEO Setup",
    text: "Essential page titles, descriptions, and technical foundations are prepared where applicable."
  },
  {
    title: "Domain Connection",
    text: "We help connect your website to your domain."
  },
  {
    title: "Launch Assistance",
    text: "We help take the website from the finished design to a live website."
  },
  {
    title: "Revisions Included",
    text: "You can review the work and request revisions within the scope of your package."
  }
] as const;

export const interestOptions = [...packages.map(item => item.title), "Not Sure Yet"];
export const timelineOptions = ["As soon as possible", "Within 1-2 weeks", "Within 1 month", "Flexible"];
