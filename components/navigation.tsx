"use client";

import { usePathname } from "next/navigation";
import Navbar from "./home/navbar";

export default function Navigation() {
  const pathname = usePathname();
  return <Navbar activePath={pathname} />;
}
