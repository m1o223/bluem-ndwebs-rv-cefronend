# NORTH SEA concept asset

`north-sea-yacht.jpg` is an original image created with the built-in image-generation tool for this fictional frontend demonstration. No external image service or tracking is used. Three model images are crops of this single temporary concept image, not photographs of distinct real boats.

Prompt: Editorial photograph of a refined fictional white motor yacht with teak deck on deep blue northern coastal water, viewed from high above the port stern, boat at right-center, curved wake, faint Scandinavian rocky coastline, natural late-afternoon light, dark open water at left for text. No people, lettering, logos, watermark, UI, or branded vessel.

# BlueMind logo

The site header uses the user's supplied original BlueMind geometric symbol with the background removed and saved as `public/images/brand/bluemind-original-logo-transparent.png`.

The logo is intentionally visible only in the main header beside the BlueMind Web Service name. Decorative page watermarks and footer logo usage have been removed so the mark is not repeated inside page content.

`public/icons/` contains browser/app icon exports generated from the same transparent logo asset. `public/favicon.ico` contains 16/32/48/64-pixel frames. Next.js root metadata imports `app/favicon-metadata.json`, so every current route inherits the same browser icons.

To reproduce favicon and app icon exports, run `node scripts/prepare-icons.mjs` from the frontend root. The script defaults to `public/images/brand/bluemind-original-logo-transparent.png` and can also receive a source image path argument.
