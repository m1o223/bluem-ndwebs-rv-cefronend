import type { Metadata } from "next";
import styles from "./sign-in.module.css";

export const metadata: Metadata = {
  title: "Sign in | BlueMind Web Service",
};

export default function SignInPage() {
  return <section className={styles.page}><h1>Sign in</h1></section>;
}
