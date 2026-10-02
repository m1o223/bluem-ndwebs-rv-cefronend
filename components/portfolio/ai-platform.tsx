"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ai-platform.module.css";

const templates = [
  {
    title: "A launch worth reading",
    category: "Marketing",
    label: "Launch announcement",
    prompt:
      "Introduce a new refillable skincare collection for people who want a simpler daily routine.",
  },
  {
    title: "Find your opening line",
    category: "Writing",
    label: "Article outline",
    prompt:
      "Write an outline for an article about making more space for creative work in a busy week.",
  },
  {
    title: "Make a good first impression",
    category: "Marketing",
    label: "Welcome email",
    prompt:
      "Welcome new members to a small community for independent designers and makers.",
  },
  {
    title: "Turn notes into next steps",
    category: "Work",
    label: "Project brief",
    prompt:
      "Plan a website refresh for an independent interior studio, focusing on project discovery and enquiries.",
  },
  {
    title: "Get everyone on the same page",
    category: "Work",
    label: "Meeting summary",
    prompt:
      "Summarise a planning meeting: choose three launch priorities, assign owners, and review progress next Friday.",
  },
  {
    title: "Say it with a little more clarity",
    category: "Writing",
    label: "Social post",
    prompt:
      "Share three practical tips for a calmer and more focused start to the working day.",
  },
];
type Draft = { id: number; title: string; body: string; type: string };
function makeDraft(prompt: string, type: string, tone: string, length: string) {
  const subject = prompt.trim().replace(/[.!?]+$/, "");
  const opener =
    tone === "Warm"
      ? "A little more considered. A little more you."
      : tone === "Bold"
        ? "Make room for what comes next."
        : "A clear idea. A purposeful next step.";
  const parts: Record<string, string> = {
    "Launch announcement": `${opener}\n\nIntroducing a fresh approach: ${subject.charAt(0).toLowerCase() + subject.slice(1)}. Thoughtfully made for everyday life, with the details that matter and nothing that gets in the way.\n\nExplore the collection and find your next everyday essential.`,
    "Article outline": `Working title: ${subject}\n\n1. Start with the everyday challenge\nDescribe the problem in a relatable opening story.\n\n2. Make space for a better approach\nOffer three small, practical changes a reader can try this week.\n\n3. Put the idea into practice\nShow a realistic example, including what to do when plans change.\n\n4. Finish with one useful next step\nInvite the reader to pick a single change and give it seven days.`,
    "Welcome email": `Subject: A good place to begin\n\nHello, and welcome.\n\n${opener} We're glad you're here. Here's the idea behind this community: ${subject.charAt(0).toLowerCase() + subject.slice(1)}.\n\nStart by introducing yourself, explore what others are making, and share one thing you'd love to work on.\n\nSee you inside,\nThe team`,
    "Project brief": `Project direction\n${subject}\n\nObjective\nCreate a clear, useful experience that helps people understand the offer and take the next step.\n\nPriorities\n• Understand the audience and their most important questions.\n• Establish a focused visual direction and a clear content structure.\n• Build and test the experience on desktop, tablet and mobile.\n\nNext step\nAgree on the scope, owners and a realistic first milestone.`,
    "Meeting summary": `Meeting notes\n${subject}\n\nDecisions\nFocus the first milestone on the three priorities with the clearest user benefit.\n\nActions\n• Confirm the scope and assign an owner to each priority.\n• Share an initial draft before the next review.\n• Collect questions and dependencies in one place.\n\nNext check-in\nReview progress, resolve open questions and agree the next milestone.`,
    "Social post": `${opener}\n\n${subject}\n\nTry this:\n01 — Pick one priority before opening your inbox.\n02 — Protect a small block of uninterrupted time.\n03 — Finish with a note about your next step.\n\nSmall changes, repeated. That's where momentum starts.`,
  };
  const body =
    (["Article outline", "Project brief", "Meeting summary"].includes(type)
      ? `${opener}\n\n`
      : "") + (parts[type] || parts["Project brief"]);
  return length === "Short"
    ? body.split("\n\n").slice(0, 3).join("\n\n")
    : length === "Detailed"
      ? `${body}\n\nBefore you publish\nCheck the details, adapt the examples to your audience, and make the voice your own.`
      : body;
}

export default function AIPlatformProject() {
  const [tab, setTab] = useState("Workspace");
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("Launch announcement");
  const [tone, setTone] = useState("Warm");
  const [length, setLength] = useState("Balanced");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState<Draft[]>([]);
  const [history, setHistory] = useState<Draft[]>([]);
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);
  const promptInput = useRef<HTMLTextAreaElement>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function generate() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setStatus("Preparing your example draft…");
    timer.current = setTimeout(() => {
      const result = {
        id: nextId.current++,
        title: prompt.trim().slice(0, 70),
        body: makeDraft(prompt, type, tone, length),
        type,
      };
      setDraft(result);
      setHistory((items) => [result, ...items].slice(0, 8));
      setBusy(false);
      setStatus("Draft ready. Edit it to make it yours.");
    }, 850);
  }
  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    setBusy(false);
    setStatus("Generation cancelled. Your prompt is still here.");
  }
  function useTemplate(template: (typeof templates)[number]) {
    setType(template.label);
    setPrompt(template.prompt);
    setTab("Workspace");
    setStatus(`Loaded ${template.label.toLowerCase()} template.`);
    requestAnimationFrame(() =>
      promptInput.current?.focus({ preventScroll: true }),
    );
  }
  function saveDraft() {
    if (!draft) return;
    setSaved((items) => [
      draft,
      ...items.filter((item) => item.id !== draft.id),
    ]);
    setStatus("Saved to your session. Drafts reset when this preview closes.");
  }
  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.body);
      setStatus("Draft copied to clipboard.");
    } catch {
      setStatus(
        "Clipboard unavailable. Select and copy the text in the editor.",
      );
    }
  }
  function openDraft(item: Draft) {
    setDraft(item);
    setTab("Workspace");
    setStatus("Draft opened in the editor.");
  }
  const shown = templates.filter(
    (item) =>
      (filter === "All" || item.category === filter) &&
      `${item.title} ${item.label}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <article
      className={styles.project}
      data-project="ai-platform"
      aria-label="ASTER writing workspace"
    >
      <header className={styles.header}>
        <button className={styles.logo} onClick={() => setTab("Workspace")}>
          <span aria-hidden="true">✳</span> aster
          <small>SPACE FOR YOUR IDEAS</small>
        </button>
        <div className={styles.session}>
          <span /> Local demo workspace
        </div>
        <button
          className={styles.newDraft}
          onClick={() => {
            cancel();
            setPrompt("");
            setDraft(null);
            setTab("Workspace");
            setStatus("A fresh page. What would you like to make?");
            requestAnimationFrame(() => promptInput.current?.focus());
          }}
        >
          New draft
        </button>
      </header>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <p className={styles.sideLabel}>YOUR STUDIO</p>
          <nav aria-label="ASTER workspace navigation">
            {["Workspace", "Templates", "Saved drafts"].map((name, i) => (
              <button
                key={name}
                aria-current={tab === name ? "page" : undefined}
                onClick={() => setTab(name)}
              >
                <span aria-hidden="true">{["◧", "▦", "▤"][i]}</span>
                {name}
                {name === "Saved drafts" && <small>{saved.length}</small>}
              </button>
            ))}
          </nav>
          <div className={styles.history}>
            <p className={styles.sideLabel}>RECENT DRAFTS</p>
            {history.length ? (
              history.slice(0, 4).map((item) => (
                <button key={item.id} onClick={() => openDraft(item)}>
                  {item.title}
                </button>
              ))
            ) : (
              <p>
                Your next good idea
                <br />
                starts right here.
              </p>
            )}
          </div>
          <div className={styles.sideNote}>
            <span aria-hidden="true">✳</span>
            <h3>
              A little direction.
              <br />A lot of possibility.
            </h3>
            <p>
              A frontend simulation. No AI service, account or data storage.
            </p>
          </div>
        </aside>
        <main className={styles.main}>
          <div className={styles.topline}>
            <span>YOUR PERSONAL WRITING STUDIO</span>
            <span>DEMO / 01</span>
          </div>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>GOOD IDEAS DESERVE A GOOD START.</p>
            <h1>
              {tab === "Templates" ? (
                "Skip the blank page."
              ) : tab === "Saved drafts" ? (
                "Ideas worth keeping."
              ) : (
                <>
                  From a thought
                  <br />
                  to <em>something good.</em>
                </>
              )}
            </h1>
            <p>
              {tab === "Templates"
                ? "Thoughtful starting points for the things you make every day."
                : tab === "Saved drafts"
                  ? "Your session collection. Open a draft and keep shaping it."
                  : "A clearer first draft. A fresh perspective. A little more room to create."}
            </p>
          </div>
          {tab === "Workspace" && (
            <>
              <div className={styles.workspace}>
                <form
                  className={styles.composer}
                  onSubmit={(e) => {
                    e.preventDefault();
                    generate();
                  }}
                >
                  <div className={styles.cardHeading}>
                    <h2>What are we making?</h2>
                    <span>01 / THE IDEA</span>
                  </div>
                  <label htmlFor="aster-prompt">
                    Tell us a little about your idea
                  </label>
                  <textarea
                    ref={promptInput}
                    id="aster-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A launch, a story, a better way to explain something…"
                    minLength={8}
                    maxLength={1200}
                    required
                    disabled={busy}
                  />
                  <div className={styles.promptMeta}>
                    <span>Be specific. A little context goes a long way.</span>
                    <span>{prompt.length}/1200</span>
                  </div>
                  <div className={styles.options}>
                    <label>
                      Make a
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        disabled={busy}
                      >
                        {templates.map((item) => (
                          <option key={item.label}>{item.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Voice
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        disabled={busy}
                      >
                        {["Warm", "Clear", "Bold"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Length
                      <select
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        disabled={busy}
                      >
                        {["Short", "Balanced", "Detailed"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className={styles.generateRow}>
                    {busy ? (
                      <button
                        key="cancel"
                        type="button"
                        className={styles.cancel}
                        onClick={(e) => {
                          e.preventDefault();
                          cancel();
                        }}
                      >
                        Cancel generation
                      </button>
                    ) : (
                      <button
                        key="generate"
                        type="submit"
                        className={styles.primary}
                      >
                        Create a draft <span aria-hidden="true">↗</span>
                      </button>
                    )}
                    <span>
                      {busy ? "Preparing example…" : "LOCAL DEMO · NO API"}
                    </span>
                  </div>
                </form>
                <section
                  className={styles.result}
                  aria-label="Draft editor"
                  aria-busy={busy}
                >
                  <div className={styles.cardHeading}>
                    <h2>Your canvas</h2>
                    <span>02 / THE DRAFT</span>
                  </div>
                  {draft ? (
                    <>
                      <div className={styles.resultTools}>
                        <span>{draft.type}</span>
                        <button onClick={copyDraft}>Copy</button>
                        <button onClick={saveDraft}>Save draft</button>
                      </div>
                      <label
                        className={styles.editorLabel}
                        htmlFor="aster-result"
                      >
                        Edit your draft
                      </label>
                      <textarea
                        id="aster-result"
                        value={draft.body}
                        onChange={(e) =>
                          setDraft((item) =>
                            item ? { ...item, body: e.target.value } : null,
                          )
                        }
                      />
                      <div className={styles.draftMeta}>
                        <span>
                          {
                            draft.body.trim().split(/\s+/).filter(Boolean)
                              .length
                          }{" "}
                          words
                        </span>
                        <span>EXAMPLE OUTPUT · NOT LIVE AI</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.blank}>
                      <div className={styles.orbit} aria-hidden="true">
                        <span>✳</span>
                      </div>
                      <h3>A little spark goes a long way.</h3>
                      <p>
                        Your draft will appear here.
                        <br />
                        Start with an idea, or borrow one below.
                      </p>
                    </div>
                  )}
                </section>
              </div>
              <section className={styles.quickTemplates}>
                <div className={styles.sectionTitle}>
                  <h2>A few places to begin</h2>
                  <button onClick={() => setTab("Templates")}>
                    Explore all templates ↗
                  </button>
                </div>
                <div className={styles.quickGrid}>
                  {templates.slice(0, 3).map((item, i) => (
                    <button key={item.title} onClick={() => useTemplate(item)}>
                      <span className={styles.templateIcon} aria-hidden="true">
                        {["↗", "≋", "✉"][i]}
                      </span>
                      <span>
                        {item.label}
                        <small>{item.category}</small>
                      </span>
                      <span aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
          {tab === "Templates" && (
            <section>
              <div className={styles.templateTools}>
                <div className={styles.filters}>
                  {["All", "Marketing", "Writing", "Work"].map((item) => (
                    <button
                      key={item}
                      aria-pressed={filter === item}
                      onClick={() => setFilter(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <label>
                  Search templates
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Find a starting point"
                  />
                </label>
              </div>
              <div className={styles.templateGrid}>
                {shown.map((item, i) => (
                  <button
                    key={item.title}
                    className={styles.templateCard}
                    onClick={() => useTemplate(item)}
                  >
                    <span>
                      {item.category} <b aria-hidden="true">0{i + 1}</b>
                    </span>
                    <h2>{item.title}</h2>
                    <p>{item.prompt}</p>
                    <small>Use {item.label.toLowerCase()} ↗</small>
                  </button>
                ))}
              </div>
              {!shown.length && (
                <p>No templates match. Try another search or category.</p>
              )}
            </section>
          )}
          {tab === "Saved drafts" && (
            <section className={styles.savedList}>
              {saved.length ? (
                saved.map((item) => (
                  <div key={item.id}>
                    <div>
                      <small>{item.type}</small>
                      <h2>{item.title}</h2>
                      <p>{item.body.slice(0, 130)}…</p>
                    </div>
                    <div>
                      <button
                        className={styles.primary}
                        onClick={() => openDraft(item)}
                      >
                        Open draft
                      </button>
                      <button
                        className={styles.cancel}
                        aria-label={`Remove saved draft ${item.title}`}
                        onClick={() =>
                          setSaved((items) =>
                            items.filter((draft) => draft.id !== item.id),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.savedEmpty}>
                  <span aria-hidden="true">▤</span>
                  <h2>A home for your good ideas.</h2>
                  <p>Create a draft, make it yours, then save it here.</p>
                  <button
                    className={styles.primary}
                    onClick={() => setTab("Workspace")}
                  >
                    Start writing
                  </button>
                </div>
              )}
            </section>
          )}
          <p className={styles.status} role="status">
            {status}
          </p>
          <footer className={styles.footer}>
            <span>Made for the way you think.</span>
            <span>ASTER — A FICTIONAL BLUEMIND CONCEPT</span>
          </footer>
        </main>
      </div>
    </article>
  );
}
