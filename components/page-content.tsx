"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import contactStyles from "../app/contact/contact.module.css";
import aboutStyles from "../app/about/about.module.css";

export default function PageContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <main className={`page-content${pathname === "/" ? " home-content" : ""}${pathname === "/contact" ? ` ${contactStyles.mainContent}` : ""}${pathname === "/about" ? ` ${aboutStyles.mainContent}` : ""}`}>{children}</main>;
}
