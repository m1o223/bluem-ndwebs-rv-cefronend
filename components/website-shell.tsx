"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "./home/sections";
import Navigation from "./navigation";
import PageContent from "./page-content";
import { isCustomerPath } from "../app/lib/customer/routes";
import BottomNavigation from "./bottom-navigation";
import RouteScrollState from "./route-scroll-state";
import RouteTransition from "./route-transition";
import SiteMenuOverlay from "./site-menu-overlay";

export default function WebsiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const customer = isCustomerPath(pathname);
  const excluded = pathname === "/dashboard-preview" || pathname === "/menu";

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (customer) return <><RouteScrollState /><RouteTransition>{children}</RouteTransition>{pathname !== "/blue-mind-ai" && <BottomNavigation />}</>;
  if (excluded) return children;
  if (pathname === "/sign-in" || pathname === "/login") return <main className="auth-page-main"><RouteScrollState /><RouteTransition>{children}</RouteTransition></main>;
  if (pathname === "/ask-ai") return <>
    <RouteScrollState />
    <RouteTransition>{children}</RouteTransition>
    <BottomNavigation menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    <SiteMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
  </>;

  return <>
    <RouteScrollState />
    <Navigation />
    <PageContent><RouteTransition>{children}</RouteTransition></PageContent>
    <Footer textEffects={pathname === "/"} />
    <BottomNavigation menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    <SiteMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
  </>;
}
