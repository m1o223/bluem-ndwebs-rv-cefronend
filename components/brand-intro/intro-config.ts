export const INTRO_STORAGE_KEY = "bluemind:brand-intro:v1";
export const INTRO_DURATION = 5350;
export const INTRO_ID = "bluemind-brand-intro";

export const wordRows = [
  ["UI/UX", "WEB"], ["HTML", "CSS", "REACT", "APP"], ["DESIGN", "WEBSITE", "DIGITAL"],
  ["JAVASCRIPT", "TYPESCRIPT", "API"],
  ["FRONTEND", "CODE", "COMPONENTS", "BACKEND"],
  ["DEVELOPMENT", "INTERFACE", "BUILD"],
  ["RESPONSIVE", "ANIMATION", "TEST"], ["CREATIVE", "PERFORMANCE"], ["INNOVATION"],
];
export const timeline = {
  formation: 1050, rotationStart: 1200, firstTurn: 1800,
  morphStart: 2400, morphEnd: 2700, rotationEnd: 3500,
  wordmarkEnd: 3900, collapseStart: 4100, collapseEnd: 4450,
  revealStart: 4550, end: INTRO_DURATION,
} as const;
export const introVariables = Object.fromEntries(Object.entries(timeline).map(([key, value]) => [`--intro-${key}`, `${value}ms`]));

// Removing this intro-owned stylesheet restores the unchanged homepage, including on Skip.
const pageRules = [
  "@keyframes bluemindIntroHome { from { opacity: 0; translate: 0 12px; } to { opacity: 1; translate: 0 0; } }",
  ...[
    ["[data-hero] h1", timeline.revealStart],
    ["[data-hero] > div > div:first-child > p", timeline.revealStart + 80],
    ["[data-hero] > div > div:first-child > div", timeline.revealStart + 160],
    ["[data-hero-visual], .home-page [data-hero] > div > a", timeline.revealStart + 250],
    ["> :not([data-hero])", timeline.revealStart + 250],
  ].map(([selector, delay]) => `.home-page ${selector} { animation: bluemindIntroHome 550ms ${delay}ms cubic-bezier(.22,.65,.22,1) both; }`),
];

// CSSOM gating runs before paint without changing React-owned markup during hydration.
// Without JavaScript, storage access, or hydration, the homepage remains independent.
export const createIntroBootstrap = (replayOnRefresh = false) => `(() => {
  if (window.__blueMindIntro || location.pathname !== "/") return;
  const state = window.__blueMindIntro = { started: 0, playing: false };
  if (!${replayOnRefresh}) {
    try { if (localStorage.getItem("${INTRO_STORAGE_KEY}")) return; } catch {}
  }
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    try { localStorage.setItem("${INTRO_STORAGE_KEY}", "complete"); } catch {}
    return;
  }
  try { localStorage.setItem("${INTRO_STORAGE_KEY}", "seen"); } catch {}
  const sheet = document.getElementById("${INTRO_ID}-gate").sheet;
  sheet.insertRule("#${INTRO_ID} { display: block; }", 0);
  ${JSON.stringify(pageRules)}.forEach(rule => sheet.insertRule(rule, sheet.cssRules.length));
  state.started = document.timeline?.currentTime ?? performance.now();
  state.playing = true;
})();`;
