# BlueMind Web Service — frontend

Home has a white agency layout: the existing design/development Hero, seven interactive website concepts, a short company summary, final CTA, and footer. The other six routes remain centered page-name placeholders.

Requires Node.js 22. Run `npm ci`, then `npm run dev` and open http://localhost:3000. Validate with `npm run typecheck` and `npm run build`; serve that build with `npm start`.

Routes: `/`, `/about`, `/services`, `/our-work`, `/how-we-work`, `/quote`, `/contact`.

## Website Concepts

Website Concepts presents original fictional demo brands created by BlueMind Web Service, not commissioned client projects or ready-to-purchase templates. Each brand opens as an interactive frontend concept inside the Home viewer:

| Brand        | Project              | Working interactions                                                                                                 |
| ------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| MORROW       | E-Commerce           | Product categories, sorting, details, quantities, bag, demo checkout and newsletter                                  |
| ASTER        | AI Platform          | Searchable templates, prompt controls, cancellable local draft generation, editable results, copy and session drafts |
| JUNE ATLAS   | Photography          | Filtered archive, full-image gallery, keyboard arrows, touch swipe and demo enquiry                                  |
| MERIDIAN     | Corporate Company    | Expandable services, filtered case studies, case details and demo enquiry                                            |
| FORM & FIELD | Furniture / Interior | Product browsing, finish options, saved edit, quantities and demo consultation                                       |
| HAVEN        | Real Estate          | Property filters, sorting, saved homes, photo galleries and demo viewing enquiry                                     |
| SERA         | Restaurant           | Menu categories, dietary filtering, dish details and a three-step demo reservation                                   |

Orders, enquiries and reservations are browser demonstrations only. No payment is collected, no booking is made and no form data is sent. ASTER creates deterministic sample text locally; it does not call an AI service. Saved selections persist while a concept is open or minimized, and reset when it is closed or replaced by another concept. Stock photos illustrate fictional concepts, not actual products or properties for sale.

Projects are lazy-loaded from `components/portfolio/registry.ts`. Shared navigation, image handling, scoped scrolling and accessible inner dialogs live in `components/portfolio/shared.tsx`. Every project owns its styles and layout. Named CSS container queries respond to the **project viewport**, including when it is narrower than the browser. Desktop, tablet and mobile arrangements use continuous sizing and container breakpoints at 1050px and 700px; the viewer toolbar resizes the actual interactive project without replacing it or resetting its state. Desktop is 1440×900, Laptop 1200×800, iPad 768×1024 (portrait) or 1024×768 (landscape), and Mobile 390×844. Each logical viewport scales to fit the viewer; Mobile uses the available native width on phones, including landscape.

Each outer concept card has one “View Demo” CTA, visible near the cover bottom for touch devices. Pointer hover or keyboard focus lifts the card by 4px, blurs only the cover by 8px and moves the same sharp CTA to its center in 260ms. The cover contains no additional opening controls. Persistent metadata retains the original brand, concept category and description.

The outer native dialog slides upward in 480ms and reverses downward before unmounting. It locks background scrolling while preserving Home scroll and focus. Its fixed toolbar contains device controls, iPad orientation, 18px red/yellow/green controls with centered SVG symbols and separate 44px targets. Red closes, yellow minimizes to a compact restore action, and green expands/restores the outer viewer. The opposite two-arrow button shares the same expansion state. Expansion preserves the selected device. Minimize keeps the demo mounted but hidden/inert, releases background scrolling, and saves internal scroll offsets. Restoring the compact action or clicking the same card resumes the session; opening another card replaces it. The restore action avoids visible page controls while scrolling. Preview widths transition in 320ms; reduced-motion preferences remove these transitions. Loading a project shows an accessible loading status. Inner dialogs trap keyboard focus, make project content inert, and scroll within the preview. Escape closes the active inner dialog first. Reduced-motion preferences disable project animation and smooth scrolling. Buttons have comfortable touch targets; galleries and menu categories support touch interaction.

No backend integration, authentication, database logic, or third-party tracking is used. No additional packages were installed. Existing environment templates are preserved for future infrastructure work.

Section introduction and card wrappers reveal once using IntersectionObserver and Web Animations, keeping hover transforms on the inner card. Cards alternate right/left with 32px desktop, 24px tablet and 14px mobile offsets, a 540ms duration and at most 80ms row stagger. The introduction moves upward by 16px. Content stays visible if observation or animation is unavailable, keyboard focus completes an active reveal, and reduced motion skips the effect.

The Hero pairs reusable HTML/CSS website and TypeScript/React preview windows, with two small supporting panels and the original BlueMind planet at 9% opacity as a background watermark. Its design, typography, spacing and logo assets are preserved; the collection CTA is now “Explore Concepts” and targets the existing `#selected-work` anchor. Navigation links to the same Home collection as “Website Concepts”; the existing `/our-work` route remains available with the corrected heading. See `public/images/ASSET-NOTES.md` for the older BlueMind and marine asset provenance; new portfolio photography is documented in `public/images/portfolio/ASSET-NOTES.md` and `assets.json`.

## Verification

Portfolio QA covers Chromium and WebKit at 1440, 1366, 1280, 1200, 1024, 834, 768, 430, 390 and 375px, including independently constrained project containers, tablet orientation changes, high-DPI rendering and emulated touch. Each project receives functional checks before the next project is developed. Browser emulation does not constitute testing on physical Apple or Android hardware.

Run `npm run typecheck` and `npm run build` before publishing. Verify all seven BlueMind routes directly and on refresh, then exercise each project on the production URL. Check console errors, image loading, overflow, keyboard focus, touch controls, reduced motion, minimize/restore state, expand synchronization and one-time scroll reveals. No lint or unit-test script is configured; browser regression checks supplement TypeScript and production builds.
