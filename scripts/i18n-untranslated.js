#!/usr/bin/env node

// Reports locale values that are byte-identical to the en-US source string.
// Key-coverage tools (`i18next-cli status`, `i18n-check`) count keys, so a
// locale file whose values were copied from English still scores 100%. This
// audit surfaces those English-copied values for human review. Identical
// values can be legitimate (brand terms, "OK", interpolation-only strings),
// so the output is informational and the script always exits 0.
//
// Usage:
//   bun scripts/i18n-untranslated.js               # per-locale summary
//   bun scripts/i18n-untranslated.js --locale de-DE # full key list for one locale
//   bun scripts/i18n-untranslated.js --all          # full key list for every locale

const fs = require("node:fs");
const path = require("node:path");

const MESSAGES_DIR = path.join(__dirname, "..", "src", "i18n", "messages");
const SOURCE_LOCALE = "en-US";

function flatten(value, prefix, out) {
  if (typeof value === "string") {
    out.set(prefix, value);
    return out;
  }
  for (const [key, child] of Object.entries(value)) {
    flatten(child, prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

function readLocale(locale) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  return flatten(JSON.parse(fs.readFileSync(file, "utf8")), "", new Map());
}

const args = process.argv.slice(2);
const listAll = args.includes("--all");
const localeFlag = args.indexOf("--locale");
const onlyLocale = localeFlag === -1 ? null : args[localeFlag + 1];

const locales = fs
  .readdirSync(MESSAGES_DIR)
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, ""))
  .filter((locale) => locale !== SOURCE_LOCALE)
  .filter((locale) => !onlyLocale || locale === onlyLocale);

if (onlyLocale && locales.length === 0) {
  console.error(`Unknown locale "${onlyLocale}" in ${MESSAGES_DIR}`);
  process.exit(1);
}

const source = readLocale(SOURCE_LOCALE);

console.log(
  `Values identical to ${SOURCE_LOCALE} (potentially untranslated; identical can be legitimate):\n`,
);

for (const locale of locales) {
  const messages = readLocale(locale);
  const identical = [];
  for (const [key, value] of messages) {
    if (source.get(key) === value) identical.push(key);
  }
  const total = messages.size;
  const percent = ((identical.length / total) * 100).toFixed(1);
  console.log(
    `${locale}: ${identical.length}/${total} identical (${percent}%)`,
  );

  if (listAll || onlyLocale) {
    for (const key of identical) console.log(`  ${key} = ${source.get(key)}`);
    console.log("");
  }
}

if (!listAll && !onlyLocale) {
  console.log("\nRun with --locale <tag> or --all to list the identical keys.");
}
