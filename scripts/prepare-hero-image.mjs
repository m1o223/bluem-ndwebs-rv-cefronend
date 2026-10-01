import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Deterministic crop/resize only: never redraw, sharpen, filter, or enlarge.
const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Usage: node scripts/prepare-hero-image.mjs <original JPEG path>");
const original = await readFile(sourcePath);
const metadata = await sharp(original).metadata();
if (metadata.width !== 1254 || metadata.height !== 1254) {
  throw new Error("This whitespace crop is specific to the supplied 1254 × 1254 image.");
}
const outputDirectory = fileURLToPath(new URL("../public/images/hero/", import.meta.url));
await mkdir(outputDirectory, { recursive: true });
// Trim surrounding white space; preserve the complete planet and both orbit ends.
const crop = { left: 115, top: 230, width: 1024, height: 768 };
const variants = [];
for (const width of [256, 384, 512, 640, 768, 1024]) {
  const filename = `bluemind-hero-${width}.webp`;
  const result = await sharp(original)
    .extract(crop)
    .resize({ width, withoutEnlargement: true, kernel: "lanczos3" })
    .webp({ lossless: true, quality: 100, effort: 6 })
    .toFile(path.join(outputDirectory, filename));
  variants.push({ filename, width: result.width, height: result.height, bytes: result.size });
}
const hash = data => createHash("sha256").update(data).digest("hex");
if (hash(await readFile(sourcePath)) !== hash(original)) throw new Error("Original source changed");
await writeFile(path.join(outputDirectory, "manifest.json"), JSON.stringify({
  source: { width: metadata.width, height: metadata.height, format: metadata.format, sha256: hash(original) },
  crop, format: "webp", lossless: true, quality: 100, upscaled: false, variants,
}, null, 2) + "\n");
console.log(JSON.stringify({ source: `${metadata.width} × ${metadata.height}`, crop, variants, originalUnchanged: true }, null, 2));
