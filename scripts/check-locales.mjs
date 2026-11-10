import fs from "node:fs";

const localeCodes = ["sv", "ar"];
const maps = Object.fromEntries(localeCodes.map((locale) => [
  locale,
  JSON.parse(fs.readFileSync(`messages/${locale}.json`, "utf8")),
]));
const keys = [...new Set(localeCodes.flatMap((locale) => Object.keys(maps[locale])))];
const failures = [];

for (const locale of localeCodes) {
  for (const key of keys) {
    if (!(key in maps[locale])) failures.push(`${locale}: missing \"${key}\"`);
    else if (typeof maps[locale][key] !== "string") failures.push(`${locale}: \"${key}\" is not a string`);
  }
}

if (failures.length) {
  console.error("Locale coverage check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Locale coverage passed: ${keys.length} shared keys across ${localeCodes.join(", ")}.`);
