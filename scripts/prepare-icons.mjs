import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const sourcePath = process.argv[2] || fileURLToPath(new URL("../public/images/brand/bluemind-original-logo-transparent.png", import.meta.url));
const source = await readFile(sourcePath);
const hash = data => createHash("sha256").update(data).digest("hex");
const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
const iconFiles = new Map([
  [16, "bluemind-16-d2c4607c1f38.png"],
  [32, "bluemind-32-2c109a90cab9.png"],
  [48, "bluemind-48-874d3d572525.png"],
  [64, "bluemind-64-4fc14061262e.png"],
  [128, "bluemind-128-1e8b467efb6f.png"],
  [152, "bluemind-152-b99b5f74776c.png"],
  [167, "bluemind-167-0f7917de3d33.png"],
  [180, "bluemind-180-4bf4c21ff471.png"],
  [192, "bluemind-192-894db5406f99.png"],
  [512, "bluemind-512-8e7ece442cf9.png"],
]);

await mkdir(new URL("../public/icons/", import.meta.url), { recursive: true });
const icons = new Map();
const icoFrames = [];

for (const [size, filename] of iconFiles) {
  const resized = sharp(source).resize(size, size, { fit: "contain", position: "center", kernel: "lanczos3", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const png = await resized.clone().png({ compressionLevel: 9, palette: false }).toBuffer();
  await writeFile(`${publicDirectory}icons/${filename}`, png);
  icons.set(size, { url: `/icons/${filename}`, sizes: `${size}x${size}`, type: "image/png" });

  if (size <= 64) {
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
  name: "BlueMind Web Service",
  short_name: "BlueMind",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#ffffff",
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
  manifest: "/site.webmanifest",
}, null, 2) + "\n");
console.log(JSON.stringify({ source: sourcePath, sourceSha256: hash(source), sizes: [...iconFiles.keys()], icoSizes: icoFrames.map(({ size }) => size) }, null, 2));

