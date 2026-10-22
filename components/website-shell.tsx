"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "./home/sections";
import Navigation from "./navigation";
import PageContent from "./page-content";

export default function WebsiteShell({ children }: { children: ReactNode }) {
  if (usePathname() === "/ask-ai") return children;
  return <><Navigation /><PageContent>{children}</PageContent><Footer /></>;
}
