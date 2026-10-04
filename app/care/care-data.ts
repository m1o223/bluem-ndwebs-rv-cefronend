export type Billing = "Monthly" | "Yearly";
export const carePlans = [
  { id: "01", name: "Care Basic", monthly: 250, yearly: 2500, popular: false, description: "Essential care for keeping your website monitored and maintained.", features: ["Website monitoring", "Backups", "Technical checks", "Standard support"] },
  { id: "02", name: "Care Plus", monthly: 500, yearly: 5000, popular: true, description: "Ongoing care, support and small updates for businesses that want extra peace of mind.", features: ["Everything in Care Basic", "Up to 30 minutes of small website changes per month", "Priority support", "Performance check"] },
  { id: "03", name: "Care Pro", monthly: 800, yearly: 8000, popular: false, description: "More hands-on care for websites that need regular attention and faster support.", features: ["Everything in Care Plus", "Up to 60 minutes of small website changes per month", "Priority support", "Performance checks", "Monthly website check", "Monthly care summary"] },
] as const;
export type PlanName = typeof carePlans[number]["name"];
export const smallChanges = ["Updating text.", "Replacing existing images.", "Updating links.", "Small content adjustments.", "Minor layout adjustments within the existing website."];
export const hostingNotice = "Hosting, domain fees and paid third-party services are not included unless stated otherwise.";
// Business policies must be confirmed before a care plan starts. No cancellation
// or automated plan-change policy is assumed by this frontend inquiry page.
export const carePolicy = {
  cancellation: "Cancellation terms will be confirmed before your plan starts.",
  planChanges: "Contact us to discuss a plan change. Availability and terms will be confirmed before any change.",
};
export const priceFor = (plan: typeof carePlans[number], billing: Billing) => `${(billing === "Monthly" ? plan.monthly : plan.yearly).toLocaleString("en-US")} SEK`;
