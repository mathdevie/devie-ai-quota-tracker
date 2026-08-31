#!/usr/bin/env node

// Sets the app version in every file that carries it, so a release bump is
// one command instead of four hand edits. The release workflow reads the
// version from src-desktop/tauri.conf.json and tags the shipped commit.
//
// Usage:
//   bun run bump 0.11.0

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");

function fail(message) {
  console.error(`bump: ${message}`);
  process.exit(1);
}

const next = process.argv[2];
if (!next || !/^\d+\.\d+\.\d+$/.test(next)) {
  fail("pass the new version as X.Y.Z, for example: bun run bump 0.11.0");
}

const tauriConfPath = path.join(ROOT, "src-desktop", "tauri.conf.json");
const current = JSON.parse(fs.readFileSync(tauriConfPath, "utf8")).version;
if (current === next) fail(`the version is already ${next}`);

function replaceOnce(file, pattern, replacement) {
  const filePath = path.join(ROOT, file);
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(pattern);
  if (!match) fail(`no version match in ${file}`);
  fs.writeFileSync(filePath, text.replace(pattern, replacement));
  console.log(`${file}: ${current} -> ${next}`);
}

replaceOnce(
  "src-desktop/tauri.conf.json",
  `"version": "${current}"`,
  `"version": "${next}"`,
);
replaceOnce("package.json", `"version": "${current}"`, `"version": "${next}"`);
replaceOnce(
  "src-desktop/Cargo.toml",
  new RegExp(`^version = "${current.replaceAll(".", "\\.")}"$`, "m"),
  `version = "${next}"`,
);
replaceOnce(
  "src-desktop/Cargo.lock",
  `name = "devie-quota"\nversion = "${current}"`,
  `name = "devie-quota"\nversion = "${next}"`,
);
