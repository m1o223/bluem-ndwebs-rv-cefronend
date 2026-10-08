import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["messages", "components", "app"];
const fileExtensions = new Set([".json", ".ts", ".tsx", ".js", ".jsx", ".css"]);
const mojibakePattern = /[ÃÂâ�]|(?:Ø|Ù)[^\s\d.,;:!?()[\]{}"'`/\\-]/u;
const allowed = new Set([
  path.join("components", "portfolio", "furniture.tsx"),
]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fileExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

const failures = [];

for (const scanRoot of scanRoots) {
  const absoluteRoot = path.join(root, scanRoot);
  if (!fs.existsSync(absoluteRoot)) continue;
  for (const file of walk(absoluteRoot)) {
    const relative = path.relative(root, file);
    if (allowed.has(relative)) continue;
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (mojibakePattern.test(line)) failures.push(`${relative}:${index + 1}: ${line.trim()}`);
    });
  }
}

if (failures.length > 0) {
  console.error("Potential mojibake/corrupted UTF-8 text found:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Translation encoding check passed.");
