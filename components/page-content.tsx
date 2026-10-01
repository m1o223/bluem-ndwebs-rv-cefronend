"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function PageContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <main className={`page-content${pathname === "/" ? " home-content" : ""}`}>{children}</main>;
}
