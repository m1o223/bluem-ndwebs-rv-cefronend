"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "./home/navbar";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/#selected-work", label: "Website Concepts" },
  { href: "/how-we-work", label: "How We Work" },
  { href: "/quote", label: "Request a Quote" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/contact") return <Navbar activePath={pathname} />;
  return (
    <nav aria-label="Main navigation" className="temporary-navigation">
      {links.map(({ href, label }) => (
        <Link key={href} href={href}>{label}</Link>
      ))}
    </nav>
  );
}
