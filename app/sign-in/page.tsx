import type { Metadata } from "next";
import SignInScreen from "./sign-in-screen";
import { getCustomer } from "../lib/customer/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in | BlueMind Web Service",
};

export default async function SignInPage() {
  if (await getCustomer()) redirect("/dashboard");
  return <SignInScreen />;
}
