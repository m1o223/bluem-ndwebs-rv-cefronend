"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const MenuState = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

// Survives customer-page navigation, but resets on refresh or leaving the customer area.
export function CustomerMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return <MenuState.Provider value={{ open, setOpen }}>{children}</MenuState.Provider>;
}

export function useCustomerMenu() {
  const state = useContext(MenuState);
  if (!state) throw new Error("Customer menu requires its provider");
  return state;
}
