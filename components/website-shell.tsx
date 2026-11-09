"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "./home/sections";
import Navigation from "./navigation";
import PageContent from "./page-content";
import { isCustomerPath } from "../app/lib/customer/routes";
import BottomNavigation from "./bottom-navigation";

export default function WebsiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isCustomerPath(pathname)) return <>{children}<BottomNavigation /></>;
  if (pathname === "/ask-ai" || pathname === "/dashboard-preview" || pathname === "/menu") return children;
  if (pathname === "/sign-in" || pathname === "/login") return <main className="auth-page-main">{children}</main>;
  return <><Navigation /><PageContent>{children}</PageContent><Footer textEffects={pathname === "/"} /><BottomNavigation /></>;
}
