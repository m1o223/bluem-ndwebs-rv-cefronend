# BlueMind Web Service — frontend

Home has a white, minimal agency layout: a website/design and code/development Hero, one interactive project showcase, short company summary, final CTA, and footer. The other six routes remain centered page-name placeholders.

Requires Node.js 22. Run `npm ci`, then `npm run dev` and open http://localhost:3000. Validate with `npm run typecheck` and `npm run build`; serve that build with `npm start`.

Routes: `/`, `/about`, `/services`, `/our-work`, `/how-we-work`, `/quote`, `/contact`.

NORTH SEA is a fictional marine demo rendered inside a native modal dialog on Home. It has independent scrolling, a navigation menu, model selection, and a demo-only viewing action. Closing with the button, Escape, or backdrop restores the previous Home scroll position and focus. Reduced-motion preferences disable animation.

No backend integration, authentication, database logic, or third-party tracking is used. No additional packages were installed. Existing environment templates are preserved for future infrastructure work.

The Hero pairs reusable HTML/CSS website and TypeScript/React preview windows, with two small supporting panels and the original BlueMind planet at 9% opacity as a background watermark. It uses a separate tablet composition and hides supporting panels on mobile. The supplied logo retains its responsive lossless WebP exports. Motion is limited to small entrance/hover movements and respects reduced-motion preferences. The small SVG navigation mark remains temporary. The marine asset is original generated imagery stored locally; see `public/images/ASSET-NOTES.md` for image dimensions, export settings, provenance, and prompt.

The tablet layout uses a compact menu up to 1120px, its own hero proportions and typography, and a three-column expanded navigation. Home and demo navigation/controls have minimum 44px touch targets. Portrait and landscape layouts adapt continuously between breakpoints.
