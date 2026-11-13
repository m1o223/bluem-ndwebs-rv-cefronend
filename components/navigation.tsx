"use client";

import { usePathname } from "next/navigation";
import Navbar from "./home/navbar";

export default function Navigation({ menuOpen, onMenuOpenChange }: { menuOpen?: boolean; onMenuOpenChange?: (open: boolean) => void }) {
  const pathname = usePathname();
  return <Navbar activePath={pathname} menuOpen={menuOpen} onMenuOpenChange={onMenuOpenChange} />;
}
