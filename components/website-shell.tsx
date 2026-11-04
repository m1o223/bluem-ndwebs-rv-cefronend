"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "./home/sections";
import Navigation from "./navigation";
import PageContent from "./page-content";
import { isCustomerPath } from "../app/lib/customer/routes";

export default function WebsiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/ask-ai" || isCustomerPath(pathname)) return children;
  if (pathname === "/sign-in") return <><Navigation /><main>{children}</main></>;
  return <><Navigation /><PageContent>{children}</PageContent><Footer /></>;
}
