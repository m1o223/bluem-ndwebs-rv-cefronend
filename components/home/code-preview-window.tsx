import type { ReactNode } from "react";
import PreviewWindowChrome from "./preview-window-chrome";
import styles from "./hero.module.css";

function Token({ kind, children }: { kind: "keyword" | "string" | "tag" | "type" | "function"; children: ReactNode }) {
  return <span className={styles[kind]}>{children}</span>;
}

const lines: ReactNode[] = [
  <><Token kind="keyword">import type</Token> {"{ "}<Token kind="type">FC</Token>{" } "}<Token kind="keyword">from</Token> <Token kind="string">&quot;react&quot;</Token>;</>,
  <><Token kind="keyword">const</Token> <Token kind="function">Hero</Token>: <Token kind="type">FC</Token> = () =&gt; (</>,
  <>  &lt;<Token kind="tag">section</Token> className=<Token kind="string">&quot;hero&quot;</Token>&gt;</>,
  <>    &lt;<Token kind="tag">h1</Token>&gt;Ideas into real websites.&lt;/<Token kind="tag">h1</Token>&gt;</>,
  <>  &lt;/<Token kind="tag">section</Token>&gt;</>,
  ");",
  "",
  <><Token kind="keyword">export default</Token> <Token kind="function">Hero</Token>;</>,
];

export default function CodePreviewWindow() {
  return (
    <div className={styles.codeWindow} data-code-preview>
      <PreviewWindowChrome title="hero.tsx" label="DEVELOPMENT" />
      <div className={styles.codeLanguages}><span>React</span><span>Next.js</span><span>TypeScript</span><span>CSS</span><i>TSX</i></div>
      <pre className={styles.codeBody}><code>{lines.map((line, index) => <span className={styles.codeLine} key={index}><span className={styles.lineNumber}>{index + 1}</span><span>{line || " "}</span></span>)}</code></pre>
      <div className={styles.codeStatus}><span><i /> Built with intention.</span><span>TypeScript React</span></div>
    </div>
  );
}
