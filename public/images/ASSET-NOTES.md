# NORTH SEA concept asset

`north-sea-yacht.jpg` is an original image created with the built-in image-generation tool for this fictional frontend demonstration. No external image service or tracking is used. Three model images are crops of this single temporary concept image, not photographs of distinct real boats.

Prompt: Editorial photograph of a refined fictional white motor yacht with teak deck on deep blue northern coastal water, viewed from high above the port stern, boat at right-center, curved wake, faint Scandinavian rocky coastline, natural late-afternoon light, dark open water at left for text. No people, lettering, logos, watermark, UI, or branded vessel.

# Supplied BlueMind Hero image

The Home Hero now uses the user's supplied `5906666964128566900.jpg` (1254 × 1254 JPEG). The original file is unchanged. Only white margins were cropped: left 115, top 230, width 1024, height 768. The full planet and orbit remain intact, with no redraw, filtering, sharpening, recoloring, or enlargement.

`hero/bluemind-hero-{256,384,512,640,768,1024}.webp` are deterministic responsive exports, at a 4:3 ratio. WebP lossless, quality 100, effort 6; Lanczos3 downsampling only for smaller sizes. Decoded pixels in the 1024 × 768 export exactly match the original crop. See `hero/manifest.json` for dimensions, byte sizes, and the original checksum.

A responsive HTML picture chooses the required resolution by viewport and pixel density, with eager loading/high fetch priority. Explicit dimensions and a reserved 4:3 aspect ratio prevent layout shift. Pre-generated lossless assets bypass further lossy image optimization. Desktop at 2× selects 1024 × 768; tablet at 2× selects 640 × 480; mobile at 2× selects 512 × 384 and at 3× selects 768 × 576. No true 4K detail can be created from this source.

To reproduce exports without altering the source, run `node scripts/prepare-hero-image.mjs <path-to-original-jpeg>` from the frontend root. Sharp is already installed through Next.js; no dependencies were added.

The small SVG navigation mark in `components/home/planet.tsx` remains the temporary version; this update changes only the Home Hero image.
