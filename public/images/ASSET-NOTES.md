# NORTH SEA concept asset

`north-sea-yacht.jpg` is an original image created with the built-in image-generation tool for this fictional frontend demonstration. No external image service or tracking is used. Three model images are crops of this single temporary concept image, not photographs of distinct real boats.

Prompt: Editorial photograph of a refined fictional white motor yacht with teak deck on deep blue northern coastal water, viewed from high above the port stern, boat at right-center, curved wake, faint Scandinavian rocky coastline, natural late-afternoon light, dark open water at left for text. No people, lettering, logos, watermark, UI, or branded vessel.

# Supplied BlueMind planet logo

The project now uses the user's supplied real 3D planet logo from `5918232791365652395.jpg`. The source is stored as `public/images/brand/bluemind-planet-logo.jpg` and is used by the reusable `BlueMindPlanetLogo` component.

Navbar, footer, reusable planet helpers, favicon metadata, app manifest icons, and decorative watermark exports are generated from this supplied logo. The visible brand name remains BlueMind Web Service while the icon mark uses the new black planet with white curved bands and orbit ring.

`hero/bluemind-hero-{256,384,512,640,768,1024}.webp` are responsive transparent-background watermark exports at a 4:3 ratio. They are intentionally blended in page CSS so the planet appears integrated with the hero instead of sitting inside a visible panel.

`public/icons/` contains PNG browser/app icon exports at 16, 32, 48, 64, 128, 152, 167, 180, 192, and 512 pixels. `public/favicon.ico` contains 16/32/48/64-pixel frames. Next.js root metadata imports `app/favicon-metadata.json`, so every current route inherits the same browser icons.

To reproduce watermark exports, run `node scripts/prepare-hero-image.mjs` from the frontend root. To reproduce favicon and app icon exports, run `node scripts/prepare-icons.mjs`. Both scripts default to `public/images/brand/bluemind-planet-logo.jpg` and can also receive a source image path argument.
