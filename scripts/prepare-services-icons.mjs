import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';

// Inputs are visually identified, in this explicit order; filenames are not classifiers.
const names = ['services-hand', 'client-to-team', 'idea-to-ready', 'no-knowledge', 'explain-idea', 'fast-delivery', 'ready-website', 'no-headaches', 'website-idea'];
const paths = process.argv.slice(2);
if (paths.length !== 9) throw new Error('Provide the nine visually verified Services images in page order.');
const outputDirectory = new URL('../public/images/services/', import.meta.url);
await mkdir(outputDirectory, { recursive: true });
const manifest = {};
for (const [index, path] of paths.entries()) {
  const original = await readFile(path);
  const hash = createHash('sha256').update(original).digest('hex');
  const { data, info } = await sharp(original).greyscale().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = 0, bottom = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[y * info.width + x] < 220) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  // Padding preserves antialiased edges while excluding distant JPEG background noise.
  left = Math.max(0, left - 8); top = Math.max(0, top - 8);
  right = Math.min(info.width - 1, right + 8); bottom = Math.min(info.height - 1, bottom + 8);
  const width = right - left + 1, height = bottom - top + 1;
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const luminance = data[(y + top) * info.width + x + left];
    // Black RGB plus coverage alpha removes the white matte, including interior holes.
    // Near-white JPEG noise is discarded; genuine edge coverage remains continuous.
    rgba[(y * width + x) * 4 + 3] = luminance >= 250 ? 0 : 255 - luminance;
  }
  const file = `${names[index]}-${hash.slice(0, 10)}.webp`;
  const result = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .webp({ lossless: true, effort: 6 }).toFile(fileURLToPath(new URL(file, outputDirectory)));
  manifest[names[index]] = {
    src: `/images/services/${file}`, width: result.width, height: result.height,
    source: basename(path), sourceSha256: hash,
    originalWidth: info.width, originalHeight: info.height,
    crop: { left, top, width, height }, format: 'lossless WebP', upscaled: false,
  };
  if (createHash('sha256').update(await readFile(path)).digest('hex') !== hash) throw new Error('Original source changed.');
}
await writeFile(new URL('manifest.json', outputDirectory), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
