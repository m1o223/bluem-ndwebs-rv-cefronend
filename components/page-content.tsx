"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import contactStyles from "../app/contact/contact.module.css";
import pageStyles from "./page-identity.module.css";

export default function PageContent({ children, header, footer }: { children: ReactNode; header: ReactNode; footer: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/ask-ai") return children;
  return <>{header}<main className={`page-content${pathname === "/" ? " home-content" : ""}${pathname === "/contact" ? ` ${contactStyles.mainContent}` : ""}${pathname === "/about" || pathname === "/services" || pathname === "/how-we-work" || pathname === "/quote" || pathname === "/care" || pathname === "/our-work" ? ` ${pageStyles.mainContent}` : ""}`}>{children}</main>{footer}</>;
}
