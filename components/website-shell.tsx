"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "./home/sections";
import Navigation from "./navigation";
import PageContent from "./page-content";
import { isCustomerPath } from "../app/lib/customer/routes";
import { CustomerMenuProvider } from "./customer-app/menu-state";

export default function WebsiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isCustomerPath(pathname)) return <CustomerMenuProvider>{children}</CustomerMenuProvider>;
  if (pathname === "/ask-ai" || pathname === "/dashboard-preview") return children;
  if (pathname === "/sign-in" || pathname === "/login") return <><Navigation /><main>{children}</main></>;
  return <><Navigation /><PageContent>{children}</PageContent><Footer textEffects={pathname === "/"} /></>;
}
