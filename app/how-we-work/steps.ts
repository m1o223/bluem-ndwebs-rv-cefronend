import { MessageSquareText, SearchCheck, PanelsTopLeft, Code2, BadgeCheck, CreditCard, PackageCheck } from "lucide-react";

export const steps = [
  { icon: MessageSquareText, title: "Tell Us What You Need", text: "Tell us about your idea, your business, and the website you have in mind." },
  { icon: SearchCheck, title: "We Review Your Project", text: "We review your request, your requirements, and the best way to build your website." },
  { icon: PanelsTopLeft, title: "Choose Your Direction", text: "We prepare up to four design concepts. You choose the direction you like most." },
  { icon: Code2, title: "We Build & Refine", text: "Once you choose a direction, we build the website and refine the details with you." },
  { icon: BadgeCheck, title: "Review & Approval", text: "You review the finished website and make sure everything is right before final delivery." },
  { icon: CreditCard, title: "Payment", text: "Once everything is approved, we complete the agreed payment before the final handover." },
  { icon: PackageCheck, title: "Final Delivery", text: "You receive your completed website, along with the files and access included in your project." },
] as const;

export const STEP_ANGLE = Math.PI * 2 / steps.length;
export const DURATION = 780;
export const wrap = (value: number) => (value % steps.length + steps.length) % steps.length;
