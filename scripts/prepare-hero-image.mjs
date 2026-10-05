import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const sourcePath = process.argv[2] || fileURLToPath(new URL("../public/images/brand/bluemind-planet-logo.jpg", import.meta.url));
const original = await readFile(sourcePath);
const metadata = await sharp(original).metadata();
const outputDirectory = fileURLToPath(new URL("../public/images/hero/", import.meta.url));
const hash = data => createHash("sha256").update(data).digest("hex");
await mkdir(outputDirectory, { recursive: true });

const variants = [];
for (const width of [256, 384, 512, 640, 768, 1024]) {
  const height = Math.round(width * 3 / 4);
  const logoSize = Math.round(height * 0.96);
  const logo = await sharp(original).resize(logoSize, logoSize, { fit: "cover", position: "center", kernel: "lanczos3" }).jpeg({ quality: 96 }).toBuffer();
  const filename = `bluemind-hero-${width}.webp`;
  const result = await sharp({ create: { width, height, channels: 3, background: "#f7f7f5" } })
    .composite([{ input: logo, left: Math.round((width - logoSize) / 2), top: Math.round((height - logoSize) / 2) }])
    .webp({ quality: 96, effort: 6 })
    .toFile(path.join(outputDirectory, filename));
  variants.push({ filename, width: result.width, height: result.height, bytes: result.size });
}

await writeFile(path.join(outputDirectory, "manifest.json"), JSON.stringify({
  source: { path: sourcePath, width: metadata.width, height: metadata.height, format: metadata.format, sha256: hash(original) },
  format: "webp",
  quality: 96,
  upscaled: false,
  variants,
}, null, 2) + "\n");
console.log(JSON.stringify({ source: sourcePath, variants }, null, 2));
