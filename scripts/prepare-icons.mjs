import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Export the supplied artwork only: crop white margins and downsample uniformly.
const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Usage: node scripts/prepare-icons.mjs <original JPEG path>");
const source = await readFile(sourcePath);
const hash = data => createHash("sha256").update(data).digest("hex");
const sourceHash = "b779c4ce7afc0a6d776b1f130aaf89f3a932b2114a345ed0e8ece629e836140b";
if (hash(source) !== sourceHash) throw new Error("Use the original supplied BlueMind JPEG.");

// This square contains the complete planet and orbit, with narrow side margins.
// The original JPEG is opaque; retain its white background instead of inventing alpha.
const crop = { left: 184, top: 163, width: 900, height: 900 };
const sizes = [16, 32, 48, 64, 128, 152, 167, 180, 192, 512];
const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
await mkdir(new URL("../public/icons/", import.meta.url), { recursive: true });
const icons = new Map();
const icoFrames = [];
for (const size of sizes) {
  const resized = sharp(source).extract(crop).resize(size, size, {
    withoutEnlargement: true, kernel: "lanczos3",
  });
  const png = await resized.clone().png({ compressionLevel: 9, palette: false }).toBuffer();
  const filename = `bluemind-${size}-${hash(png).slice(0, 12)}.png`;
  await writeFile(`${publicDirectory}icons/${filename}`, png);
  icons.set(size, { url: `/icons/${filename}`, sizes: `${size}x${size}`, type: "image/png" });

  if (size <= 64) {
    // Standard 32-bit ICO bitmap frames, including an opaque AND mask.
    const rgba = await resized.clone().ensureAlpha().raw().toBuffer();
    const maskRowBytes = Math.ceil(size / 32) * 4;
    const frame = Buffer.alloc(40 + size * size * 4 + maskRowBytes * size);
    frame.writeUInt32LE(40, 0);
    frame.writeInt32LE(size, 4);
    frame.writeInt32LE(size * 2, 8);
    frame.writeUInt16LE(1, 12);
    frame.writeUInt16LE(32, 14);
    frame.writeUInt32LE(frame.length - 40, 20);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const from = (y * size + x) * 4;
        const to = 40 + ((size - 1 - y) * size + x) * 4;
        frame[to] = rgba[from + 2];
        frame[to + 1] = rgba[from + 1];
        frame[to + 2] = rgba[from];
        frame[to + 3] = rgba[from + 3];
      }
    }
    icoFrames.push({ size, frame });
  }
}

const directory = Buffer.alloc(6 + icoFrames.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(icoFrames.length, 4);
let offset = directory.length;
icoFrames.forEach(({ size, frame }, index) => {
  const entry = 6 + index * 16;
  directory[entry] = directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
const ico = Buffer.concat([directory, ...icoFrames.map(({ frame }) => frame)]);
await writeFile(`${publicDirectory}favicon.ico`, ico);
const faviconUrl = `/favicon.ico?v=${hash(ico).slice(0, 12)}`;

const manifest = JSON.stringify({
  name: "BlueMind Web Service", short_name: "BlueMind", start_url: "/", scope: "/",
  display: "browser", background_color: "#ffffff",
  icons: [192, 512].map(size => ({ src: icons.get(size).url, sizes: `${size}x${size}`, type: "image/png", purpose: "any" })),
}, null, 2) + "\n";
await writeFile(`${publicDirectory}site.webmanifest`, manifest);
await writeFile(new URL("../app/favicon-metadata.json", import.meta.url), JSON.stringify({
  icons: {
    icon: [
      { url: faviconUrl, type: "image/x-icon", sizes: "16x16 32x32 48x48 64x64" },
      ...[16, 32, 48, 64].map(size => icons.get(size)),
    ],
    shortcut: faviconUrl,
    apple: [152, 167, 180].map(size => icons.get(size)),
  },
  manifest: `/site.webmanifest?v=${hash(manifest).slice(0, 12)}`,
}, null, 2) + "\n");
if (hash(await readFile(sourcePath)) !== sourceHash) throw new Error("Original source changed.");
console.log(JSON.stringify({ source: sourcePath, sourceDimensions: "1254x1254", crop, sizes, icoSizes: icoFrames.map(({ size }) => size), originalUnchanged: true, upscaled: false }, null, 2));
