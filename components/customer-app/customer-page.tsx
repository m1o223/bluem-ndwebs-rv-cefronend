import { requireCustomer } from "../../app/lib/customer/session";
import type { CustomerPage as Page } from "../../app/lib/customer/routes";
import CustomerShell from "./customer-shell";

// Every page verifies the session, including client navigation. A layout-only check is insufficient.
export default async function CustomerPage({ page }: { page: Page }) {
  const user = await requireCustomer();
  return <CustomerShell user={user} page={page} />;
}
