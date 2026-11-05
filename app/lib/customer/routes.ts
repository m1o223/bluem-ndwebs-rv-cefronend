export const customerRoutes = [
  { href: "/dashboard", key: "home" },
  { href: "/my-project", key: "project" },
  { href: "/blue-mind-ai", key: "ai" },
  { href: "/dashboard/contact", key: "contact" },
  { href: "/account", key: "account" },
] as const;
export type CustomerPage = typeof customerRoutes[number]["key"];
export const isCustomerPath = (path: string) => customerRoutes.some(route => path === route.href);
export type Customer = { id: string; displayName: string; email: string; profileImage?: string | null; role?: "user"; status?: "active" };
