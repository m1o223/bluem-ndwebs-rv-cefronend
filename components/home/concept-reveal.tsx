"use client";

import type { ReactNode } from "react";

export default function ConceptReveal({ children }: {
  children: ReactNode;
  direction: "right" | "left" | "up";
  stagger?: boolean;
}) {
  return <>{children}</>;
}
