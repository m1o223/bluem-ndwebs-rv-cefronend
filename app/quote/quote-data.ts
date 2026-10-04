export const packages = [
  {
    "id": "01",
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
    "cta": "Get My Quote",
    "popular": false
  },
  {
    "id": "02",
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
    "cta": "Get My Quote",
    "popular": false
  },
  {
    "id": "03",
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
    "cta": "Get My Quote",
    "popular": true
  },
  {
    "id": "04",
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
    "cta": "Get My Quote",
    "popular": false
  },
  {
    "id": "05",
    "title": "Online Store",
    "price": "From 12,990 SEK",
    "delivery": "Estimated delivery: 10–18 days",
    "scope": null,
    "description": "An online store built around your products and your business.",
    "features": [
      "Custom store design",
      "Mobile, tablet & desktop included",
      "Responsive design",
      "Product pages",
      "Product management setup",
      "Shopping cart",
      "Checkout setup",
      "Payment integration",
      "Basic SEO setup",
      "Domain connection",
      "Store launch assistance",
      "Revisions included"
    ],
    "cta": "Get My Quote",
    "popular": false
  },
  {
    "id": "06",
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
    "cta": "Tell Us Your Idea",
    "popular": false
  }
] as const;

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
