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
      "Design adjustments before delivery within the agreed plan.",
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
      "Advanced shipping integrations, extra languages, and special features may cost extra."
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
