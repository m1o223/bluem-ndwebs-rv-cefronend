import type { Metadata } from "next";
import SignInScreen from "./sign-in-screen";
import { CustomerSessionUnavailable, getCustomer } from "../lib/customer/session";
import SessionRecovery from "../../components/customer-app/session-recovery";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get Started | BlueMind Web Service",
};

export default async function SignInPage() {
  try {
    if (await getCustomer()) redirect("/dashboard");
  } catch (error) {
    if (error instanceof CustomerSessionUnavailable) return <SessionRecovery />;
    throw error;
  }
  return <SignInScreen />;
}
