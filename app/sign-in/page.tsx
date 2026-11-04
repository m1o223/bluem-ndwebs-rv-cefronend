import type { Metadata } from "next";
import SignInScreen from "./sign-in-screen";

export const metadata: Metadata = {
  title: "Sign in | BlueMind Web Service",
};

export default function SignInPage() {
  return <SignInScreen />;
}
