export const INTRO_STORAGE_KEY = "bluemind:brand-intro:v1";
export const INTRO_DURATION = 4000;
export const INTRO_ID = "bluemind-brand-intro";

export const words = ["CODE", "DESIGN", "HTML", "CSS", "JAVASCRIPT", "REACT", "TYPESCRIPT", "UI/UX", "FRONTEND", "BACKEND", "DEVELOPMENT", "RESPONSIVE", "COMPONENTS", "WEBSITE", "INTERFACE", "CREATIVE", "DIGITAL", "INNOVATION", "PERFORMANCE", "ANIMATION"];

// CSSOM gating runs before paint without changing React-owned markup during hydration.
// Without JavaScript, storage access, or hydration, the homepage remains independent.
export const introBootstrap = `(() => {
  if (window.__blueMindIntro || location.pathname !== "/") return;
  const state = window.__blueMindIntro = { started: 0, playing: false };
  try { if (localStorage.getItem("${INTRO_STORAGE_KEY}")) return; } catch {}
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    try { localStorage.setItem("${INTRO_STORAGE_KEY}", "complete"); } catch {}
    return;
  }
  try { localStorage.setItem("${INTRO_STORAGE_KEY}", "seen"); } catch {}
  const sheet = document.getElementById("${INTRO_ID}-gate").sheet;
  sheet.insertRule("#${INTRO_ID} { display: block; }", 0);
  state.started = performance.now();
  state.playing = true;
})();`;
