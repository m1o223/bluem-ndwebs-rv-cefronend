# Portfolio assets

The seven brands are original fictional portfolio concepts. MORROW packaging is original reusable SVG artwork in `components/portfolio/product-art.tsx`; it remains sharp at any display density.

The 21 photographic assets are curated Unsplash images, stored locally as WebP. `assets.json` records each source URL, the [Unsplash license](https://unsplash.com/license), exported pixel dimensions and byte size. Photographs illustrate fictional projects; they do not depict actual products, properties or businesses offered for sale by BlueMind.

Photos were downloaded at up to 2000px wide, with six prominent hero/studio images sourced at 3200px wide for high-DPI presentation. Sharp auto-orientation and WebP quality 90 / effort 6 preserve detail. No artificial upscaling was applied. The downloaded source files and the original supplied BlueMind logo were not overwritten.

Next.js Image serves responsive optimized versions at quality 90, with fixed-aspect containers, explicit `sizes`, object-fit cropping and appropriate hero preloading. Full-image photography dialogs use `object-fit: contain`. Image requests remain on the BlueMind origin; visitors do not fetch photographs from Unsplash directly.

The provided BlueMind identity, Hero artwork and favicon are separate existing assets and were not changed for this portfolio task.
