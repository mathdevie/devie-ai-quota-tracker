import { runInNewContext } from "node:vm";
import { expect, test } from "vite-plus/test";
import { themeBootScript } from "../src/app/boot";
import { THEMES } from "../src/theme/registry";

const allowed = THEMES.map((theme) => theme.className);
const boot = themeBootScript(allowed);

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
    expect(saved).toBe("theme-catppuccin-latte");
    expect(document.documentElement.dataset.devieTheme).toBe(saved);
    runInNewContext(boot, context);
    expect(document.documentElement.dataset.devieTheme).toBe(saved);
  });
}

for (const dark of [false, true]) {
  test(`System appearance is preserved (dark=${dark})`, () => {
    const document = { documentElement: { dataset: { devieTheme: "" } } };
    runInNewContext(boot, {
      document,
      localStorage: { getItem: () => "system", setItem: () => {} },
      matchMedia: () => ({ matches: dark }),
    });
    expect(document.documentElement.dataset.devieTheme).toBe(dark ? "theme-dark" : "theme-light");
  });
}

test.each([null, "unknown-theme", "theme-default"])("pre-paint normalizes %s", (saved) => {
  const document = { documentElement: { dataset: { devieTheme: "" } } };
  let persisted = saved;
  runInNewContext(boot, {
    document,
    localStorage: {
      getItem: () => saved,
      setItem: (_key: string, value: string) => {
        persisted = value;
      },
    },
    matchMedia: () => ({ matches: true }),
  });
  expect(persisted).toBe(saved === "theme-default" ? "theme-light" : "system");
  expect(document.documentElement.dataset.devieTheme).toBe(
    saved === "theme-default" ? "theme-light" : "theme-dark",
  );
});

test("pre-paint remains safe when storage is unavailable", () => {
  const document = { documentElement: { dataset: { devieTheme: "" } } };
  runInNewContext(boot, {
    document,
    localStorage: {
      getItem: () => {
        throw new Error("denied");
      },
    },
  });
  expect(document.documentElement.dataset.devieTheme).toBe("theme-light");
});
