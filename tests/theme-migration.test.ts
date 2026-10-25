import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const layout = readFileSync("src/app/layout.tsx", "utf8");
const registry = readFileSync("src/theme/registry.ts", "utf8");
const allowed = [
  "system",
  "theme-light",
  "theme-dark",
  ...Array.from(
    registry.matchAll(/className: "([^"]+)"/g),
    (match) => match[1],
  ),
];
const boot = layout
  .split("const themeBootScript = `")[1]
  .split("`;\n")[0]
  .replace(
    /\$\{JSON.stringify\(THEMES.map\(\(theme\) => theme.className\)\)\}/,
    JSON.stringify(allowed),
  );

for (const dark of [false, true]) {
  test(`legacy theme migrates before hydration and survives reload (system dark=${dark})`, () => {
    let saved = "theme-catpuccin-latte";
    const document = {
      documentElement: { dataset: { devieTheme: "theme-light" } },
    };
    const context = {
      document,
      localStorage: {
        getItem: () => saved,
        setItem: (_key: string, value: string) => {
          saved = value;
        },
      },
      matchMedia: () => ({ matches: dark }),
    };
    runInNewContext(boot, context);
    assert.equal(saved, "theme-catppuccin-latte");
    assert.equal(document.documentElement.dataset.devieTheme, saved);
    runInNewContext(boot, context);
    assert.equal(document.documentElement.dataset.devieTheme, saved);
  });
}

test("runtime storage listener migrates legacy values from another window", () => {
  const provider = readFileSync("src/theme/ThemeContext.tsx", "utf8");
  const handler = provider
    .split("function handleStorageChange(event: StorageEvent) {")[1]
    .split("\n    }")[0];
  let selected = "system";
  let persisted = "";
  let preview: unknown = "theme-dark";
  runInNewContext(`(() => { ${handler} })()`, {
    event: { key: "devie-quota-theme:v1", newValue: "theme-catpuccin-latte" },
    STORAGE_KEY: "devie-quota-theme:v1",
    LEGACY_THEMES: runInNewContext(
      `(${provider.split("const LEGACY_THEMES: Record<string, string> = ")[1].split(";\n")[0]})`,
      { LIGHT_THEME: "theme-light" },
    ),
    ALLOWED_THEMES: new Set(allowed),
    persistTheme: (value: string) => {
      persisted = value;
    },
    setSelectedTheme: (value: string) => {
      selected = value;
    },
    setPreviewedTheme: (value: unknown) => {
      preview = value;
    },
  });
  assert.equal(selected, "theme-catppuccin-latte");
  assert.equal(persisted, selected);
  assert.equal(preview, null);
});

for (const dark of [false, true]) {
  test(`System appearance is preserved (dark=${dark})`, () => {
    const document = { documentElement: { dataset: { devieTheme: "" } } };
    runInNewContext(boot, {
      document,
      localStorage: { getItem: () => "system", setItem: () => {} },
      matchMedia: () => ({ matches: dark }),
    });
    assert.equal(
      document.documentElement.dataset.devieTheme,
      dark ? "theme-dark" : "theme-light",
    );
  });
}
