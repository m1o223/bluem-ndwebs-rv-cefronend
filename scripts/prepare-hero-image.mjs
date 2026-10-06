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
  const logoInput = await sharp(original)
    .resize(logoSize, logoSize, { fit: "cover", position: "center", kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = logoInput;
  const isBackgroundPixel = index => {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    return max > 204 && max - min < 28;
  };
  const visited = new Uint8Array(info.width * info.height);
  const queue = [];
  const add = (x, y) => {
    if (x < 0 || y < 0 || x >= info.width || y >= info.height) return;
    const pixel = y * info.width + x;
    if (visited[pixel]) return;
    const index = pixel * 4;
    if (!isBackgroundPixel(index)) return;
    visited[pixel] = 1;
    queue.push([x, y]);
  };

  for (let x = 0; x < info.width; x += 1) {
    add(x, 0);
    add(x, info.height - 1);
  }
  for (let y = 0; y < info.height; y += 1) {
    add(0, y);
    add(info.width - 1, y);
  }
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const [x, y] = queue[cursor];
    add(x + 1, y);
    add(x - 1, y);
    add(x, y + 1);
    add(x, y - 1);
  }
  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (!visited[pixel]) continue;
    const index = pixel * 4;
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const brightness = Math.max(red, green, blue);
    data[index + 3] = brightness > 230 ? 0 : Math.max(0, Math.round((230 - brightness) * 5));
  }

  const logo = await sharp(data, { raw: info }).webp({ quality: 96, effort: 6 }).toBuffer();
  const filename = `bluemind-hero-${width}.webp`;
  const result = await sharp({ create: { width, height, channels: 4, background: "#ffffff00" } })
    .composite([{ input: logo, left: Math.round((width - logoSize) / 2), top: Math.round((height - logoSize) / 2) }])
    .webp({ quality: 96, effort: 6 })
    .toFile(path.join(outputDirectory, filename));
  variants.push({ filename, width: result.width, height: result.height, bytes: result.size });
}

await writeFile(path.join(outputDirectory, "manifest.json"), JSON.stringify({
  source: { path: sourcePath, width: metadata.width, height: metadata.height, format: metadata.format, sha256: hash(original) },
  format: "webp",
  background: "transparent",
  quality: 96,
  upscaled: false,
  variants,
}, null, 2) + "\n");
console.log(JSON.stringify({ source: sourcePath, variants }, null, 2));
