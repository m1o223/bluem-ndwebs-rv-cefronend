"use client";

import { useCallback, useEffect, useState } from "react";
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

function AmbientPageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`site-ambient-shell${className ? ` ${className}` : ""}`}>{children}</div>;
}

export default function WebsiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const [menuScrollPosition, setMenuScrollPosition] = useState({ x: 0, y: 0 });
  const setMenuOpenWithPosition = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      setMenuScrollPosition({ x: window.scrollX, y: window.scrollY });
    }
    setMenuOpen(nextOpen);
  }, []);
  const customer = isCustomerPath(pathname);
  const excluded = pathname === "/dashboard-preview" || pathname === "/menu" || pathname.startsWith("/demo/restaurant");
  const homePage = pathname === "/";

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (customer) return <AmbientPageShell className="account-ambient"><RouteScrollState /><RouteTransition>{children}</RouteTransition>{pathname !== "/blue-mind-ai" && <BottomNavigation />}</AmbientPageShell>;
  if (excluded) return children;
  if (pathname === "/sign-in" || pathname === "/login") return <AmbientPageShell className="auth-ambient"><main className="auth-page-main"><RouteScrollState /><RouteTransition>{children}</RouteTransition></main></AmbientPageShell>;
  if (pathname === "/ask-ai") return <AmbientPageShell className="ai-ambient">
    <RouteScrollState />
    <RouteTransition>{children}</RouteTransition>
  </AmbientPageShell>;

  return <AmbientPageShell>
    <RouteScrollState />
    <Navigation menuOpen={menuOpen} onMenuOpenChange={setMenuOpenWithPosition} />
    <PageContent><RouteTransition>{children}</RouteTransition></PageContent>
    {homePage ? null : <Footer textEffects={pathname === "/"} />}
    <SiteMenuOverlay open={menuOpen} onClose={closeMenu} scrollPosition={menuScrollPosition} currentPath={pathname} />
  </AmbientPageShell>;
}
