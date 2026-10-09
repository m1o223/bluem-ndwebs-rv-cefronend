export const packages = [
  {
    "id": "01",
    "checkoutId": "one-page-website",
    "title": "One Page Website",
    "price": "From 4,490 SEK",
    "delivery": "Estimated delivery: 3–5 days",
    "scope": null,
    "description": "A focused one-page website for a service, product, personal brand, or small business.",
    "features": [
      "Custom design",
      "You choose the design direction",
      "One complete page",
      "Mobile, tablet & desktop included",
      "Responsive design",
      "Contact section or form",
      "Basic SEO setup",
      "Domain connection",
      "Launch assistance",
      "Revisions included"
    ],
    "cta": "Get Started",
    "popular": false
  },
  {
    "id": "02",
    "checkoutId": "small-website",
    "title": "Small Website",
    "price": "From 5,990 SEK",
    "delivery": "Estimated delivery: 4–6 days",
    "scope": "Up to 3 pages",
    "description": "A complete small website for businesses that need more than a single page.",
    "features": [
      "Custom design",
      "You choose the design direction",
      "Up to 3 pages",
      "Mobile, tablet & desktop included",
      "Responsive design",
      "Contact form",
      "Basic SEO setup",
      "Domain connection",
      "Launch assistance",
      "Revisions included"
    ],
    "cta": "Get Started",
    "popular": false
  },
  {
    "id": "03",
    "checkoutId": "business-website",
    "title": "Business Website",
    "price": "From 7,490 SEK",
    "delivery": "Estimated delivery: 5–8 days",
    "scope": "Up to 5 pages",
    "description": "A professional website for businesses that need a stronger online presence.",
    "features": [
      "Professional custom design",
      "You choose the design direction",
      "Up to 5 pages",
      "Mobile, tablet & desktop included",
      "Responsive design",
      "Contact forms",
      "Basic SEO setup",
      "Custom sections",
      "Subtle animations where appropriate",
      "Domain connection",
      "Launch assistance",
      "Revisions included"
    ],
    "cta": "Get Started",
    "popular": true
  },
  {
    "id": "04",
    "checkoutId": "business-plus",
    "title": "Business Plus",
    "price": "From 9,990 SEK",
    "delivery": "Estimated delivery: 7–12 days",
    "scope": "Up to 10 pages",
    "description": "For growing businesses that need more content, sections, and functionality.",
    "features": [
      "Professional custom design",
      "You choose the design direction",
      "Up to 10 pages",
      "Mobile, tablet & desktop included",
      "Responsive design",
      "Multiple forms where needed",
      "Basic SEO setup",
      "Custom sections",
      "Enhanced animations",
      "More advanced website setup",
      "Domain connection",
      "Launch assistance",
      "Revisions included"
    ],
    "cta": "Get Started",
    "popular": false
  },
  {
    "id": "05",
    "checkoutId": "online-store-standard",
    "title": "Online Store Standard",
    "price": "From 11,990 SEK",
    "delivery": "Estimated delivery depends on the agreed features and project scope.",
    "scope": null,
    "description": "A complete starter e-commerce solution for small businesses that need a professional store with essential selling tools.",
    "features": [
      "Custom professional store design",
      "Mobile, tablet & desktop included",
      "Responsive design",
      "Homepage and essential store pages",
      "Product catalog and categories",
      "Product images, descriptions, and prices",
      "Product search",
      "Shopping cart",
      "Secure checkout",
      "Visa and Mastercard payment integration",
      "Apple Pay and Google Pay where supported",
      "Basic admin dashboard",
      "Add, edit, and remove products",
      "Basic inventory management",
      "Customer order management",
      "Shipping method selection",
      "Manual shipment processing",
      "Customer order confirmation emails",
      "Contact page",
      "Social media links",
      "Basic SEO setup",
      "Domain connection",
      "Launch assistance"
    ],
    "cta": "Get Started",
    "popular": false,
    "frontendPreview": true
  },
  {
    "id": "06",
    "checkoutId": "online-store-advanced",
    "title": "Online Store Advanced",
    "price": "From 19,990 SEK",
    "delivery": "Estimated delivery depends on the agreed features and project scope.",
    "scope": "Most complete e-commerce option",
    "description": "A more powerful store for businesses that need customer accounts, automation, advanced inventory tools, and shipping integrations.",
    "features": [
      "Everything in Online Store Standard",
      "Advanced custom e-commerce design",
      "More flexible page layouts",
      "Customer accounts and secure login",
      "Customer profile management",
      "Order history",
      "Advanced product search and filters",
      "Product variants, sizes, colors, and options",
      "Advanced inventory management",
      "Low-stock alerts",
      "Discount codes and promotions",
      "Featured products and special offers",
      "Automated order status emails",
      "Shipping status and tracking information",
      "PostNord or DHL integration where supported",
      "Automated shipping-label creation where supported by the carrier account and API",
      "Delivery options at checkout",
      "Advanced admin dashboard",
      "Sales overview and basic analytics",
      "Customer management",
      "Order management and status updates",
      "Mobile-optimized checkout",
      "Enhanced SEO configuration",
      "Security and performance optimization",
      "Domain connection",
      "Launch assistance",
      "Design revisions within the agreed project scope"
    ],
    "note": "Shipping integrations can depend on carrier approval, account access, API availability, and third-party fees.",
    "cta": "Get Started",
    "popular": true,
    "badge": "MOST COMPLETE",
    "frontendPreview": true
  },
  {
    "id": "07",
    "checkoutId": "custom-website",
    "title": "Custom Website",
    "price": "Custom Quote",
    "delivery": "Timeline based on your project",
    "scope": null,
    "description": "For projects that need custom functionality beyond our standard website packages.",
    "features": [
      "Built around your requirements",
      "Custom functionality",
      "Custom design",
      "Responsive across devices",
      "Advanced forms or workflows",
      "Booking features where required",
      "Login or account features where required",
      "API integrations where required",
      "Project-specific setup",
      "Launch assistance"
    ],
    "cta": "Request a Quote",
    "popular": false
  }
] as const;

export const testPackage = {
  "id": "TEST",
  "checkoutId": "bluemind-test-package",
  "title": "BlueMind Test Package",
  "price": "10 SEK - Test Mode",
  "delivery": "Sandbox checkout verification only",
  "scope": "Sandbox Test Only - No Real Payment",
  "description": "A test package created to verify BlueMind's secure checkout, payment confirmation, order processing, and email notification system.",
  "features": [
    "Secure checkout test",
    "Payment confirmation",
    "Order tracking",
    "Email notifications",
    "Admin Dashboard integration"
  ],
  "cta": "Test Purchase",
  "popular": false,
  "testOnly": true
} as const;

export const includedFeatures = [
  {
    "title": "Custom design",
    "text": "Your website is designed around your idea and your project."
  },
  {
    "title": "You choose the design direction",
    "text": "You’re involved in choosing the look and direction of your website."
  },
  {
    "title": "Mobile, Tablet & Desktop",
    "text": "Your website is designed to work across different screen sizes at no extra design charge."
  },
  {
    "title": "Responsive Design",
    "text": "The layout automatically adapts to different devices and screen sizes."
  },
  {
    "title": "Basic SEO Setup",
    "text": "Essential page titles, descriptions, and technical foundations are prepared where applicable."
  },
  {
    "title": "Domain Connection",
    "text": "We help connect your website to your domain."
  },
  {
    "title": "Launch Assistance",
    "text": "We help take the website from the finished design to a live website."
  },
  {
    "title": "Revisions Included",
    "text": "You can review the work and request revisions within the scope of your package."
  }
] as const;

export const interestOptions = [...packages.map(item => item.title), "Not Sure Yet"];
export const timelineOptions = ["As soon as possible", "Within 1–2 weeks", "Within 1 month", "Flexible"];
