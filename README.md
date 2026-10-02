# BlueMind Web Service — frontend

Home has a white agency layout: the existing design/development Hero, seven interactive portfolio concepts, a short company summary, final CTA, and footer. The other six routes remain centered page-name placeholders.

Requires Node.js 22. Run `npm ci`, then `npm run dev` and open http://localhost:3000. Validate with `npm run typecheck` and `npm run build`; serve that build with `npm start`.

Routes: `/`, `/about`, `/services`, `/our-work`, `/how-we-work`, `/quote`, `/contact`.

## Interactive portfolio

Each original fictional brand opens as a complete frontend concept inside the Home project viewer:

| Brand | Project | Working interactions |
| --- | --- | --- |
| MORROW | E-Commerce | Product categories, sorting, details, quantities, bag, demo checkout and newsletter |
| ASTER | AI Platform | Searchable templates, prompt controls, cancellable local draft generation, editable results, copy and session drafts |
| JUNE ATLAS | Photography | Filtered archive, full-image gallery, keyboard arrows, touch swipe and demo enquiry |
| MERIDIAN | Corporate Company | Expandable services, filtered case studies, case details and demo enquiry |
| FORM & FIELD | Furniture / Interior | Product browsing, finish options, saved edit, quantities and demo consultation |
| HAVEN | Real Estate | Property filters, sorting, saved homes, photo galleries and demo viewing enquiry |
| SERA | Restaurant | Menu categories, dietary filtering, dish details and a three-step demo reservation |

Orders, enquiries and reservations are browser demonstrations only. No payment is collected, no booking is made and no form data is sent. ASTER creates deterministic sample text locally; it does not call an AI service. Saved selections last only within the currently open project session. Stock photos illustrate fictional concepts, not actual products or properties for sale.

Projects are lazy-loaded from `components/portfolio/registry.ts`. Shared navigation, image handling, scoped scrolling and accessible inner dialogs live in `components/portfolio/shared.tsx`. Every project owns its styles and layout. Named CSS container queries respond to the **project viewport**, including when it is narrower than the browser. Desktop, tablet and mobile arrangements use continuous sizing and container breakpoints at 1050px and 700px; a future device preview toolbar can resize that viewport without rewriting projects. The toolbar is intentionally deferred.

The outer native dialog preserves Home scroll and focus. Inner dialogs trap keyboard focus, make project content inert, and scroll within the preview. Escape closes the active inner dialog first. Reduced-motion preferences disable project animation and smooth scrolling. Buttons have comfortable touch targets; galleries and menu categories support touch interaction.

No backend integration, authentication, database logic, or third-party tracking is used. No additional packages were installed. Existing environment templates are preserved for future infrastructure work.

The Hero pairs reusable HTML/CSS website and TypeScript/React preview windows, with two small supporting panels and the original BlueMind planet at 9% opacity as a background watermark. Its design, header, CTAs and logo assets are preserved. See `public/images/ASSET-NOTES.md` for the older BlueMind and marine asset provenance; new portfolio photography is documented in `public/images/portfolio/ASSET-NOTES.md` and `assets.json`.

## Verification

Portfolio QA covers Chromium and WebKit at 1440, 1366, 1280, 1200, 1024, 834, 768, 430, 390 and 375px, including independently constrained project containers, tablet orientation changes, high-DPI rendering and emulated touch. Each project receives functional checks before the next project is developed. Browser emulation does not constitute testing on physical Apple or Android hardware.

Run `npm run typecheck` and `npm run build` before publishing. Verify all seven BlueMind routes directly and on refresh, then exercise each project on the production URL. Check console errors, image loading, overflow, keyboard focus, touch controls and reduced motion.
