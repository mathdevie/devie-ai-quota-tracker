import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { transform } from "@svgr/core";
import jsx from "@svgr/plugin-jsx";
import svgo from "@svgr/plugin-svgo";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins, type Plugin, runnerImport, transformWithOxc } from "vite-plus";
import { themeBootScript } from "./src/app/boot";

// The desktop version lives in the Tauri config; Settings shows it.
const { version } = JSON.parse(readFileSync("src-desktop/tauri.conf.json", "utf8")) as {
  version: string;
};

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

function svgComponents(): Plugin {
  return {
    name: "devie-quota:svg-components",
    enforce: "pre",
    async load(id) {
      if (!id.endsWith(".svg")) return null;
      const source = await transform(
        readFileSync(id, "utf8"),
        {
          plugins: [svgo, jsx],
          svgoConfig: {
            plugins: [
              {
                name: "preset-default",
                params: { overrides: { removeViewBox: false } },
              },
            ],
          },
        },
        { filePath: id },
      );
      return transformWithOxc(source, `${id}.jsx`, {
        jsx: { runtime: "automatic" },
      });
    },
  };
}

// The registry imports SVG thumbnails, so it loads through Vite rather than
// the config bundler. It stays the only list of allowed themes.
function themeBoot(): Plugin {
  return {
    name: "devie-quota:theme-boot",
    transformIndexHtml: {
      order: "pre",
      async handler() {
        const { module } = await runnerImport<typeof import("./src/theme/registry")>(
          "/src/theme/registry.ts",
          {
            configFile: false,
            logLevel: "silent",
            plugins: [svgComponents()],
            resolve: { alias },
          },
        );
        const themes = module.THEMES.map((theme) => theme.className);
        return [
          {
            tag: "script",
            children: themeBootScript(themes),
            injectTo: "head-prepend",
          },
        ];
      },
    },
  };
}

export default defineConfig({
  plugins: lazyPlugins(() => [svgComponents(), react({ compiler: true }), themeBoot()]),
  resolve: { alias },
  define: { "import.meta.env.VITE_APP_VERSION": JSON.stringify(version) },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    env: { TZ: "UTC" },
    // `bun run test --coverage` gates the app-owned logic and components
    // with the most risk; it is not a whole-app percentage.
    coverage: {
      include: [
        "src/features/quota/filters.ts",
        "src/features/connections/{labels.ts,QuotaBars.tsx,ResetCredits.tsx,QuotaBarsDialog.tsx,LoginDialog.tsx}",
        "src/features/desktop/desktop.ts",
        "src/helpers/date.ts",
        "src/app/boot.ts",
        "src/theme/ThemeContext.tsx",
      ],
      reporter: ["text", "html", "lcov"],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
    },
  },
  server: {
    port: 3002,
    strictPort: true,
    watch: { ignored: ["**/src-desktop/**"] },
  },
  build: {
    target: "safari15",
    outDir: "out",
    // One local bundle loaded from disk by the webview; splitting adds nothing.
    chunkSizeWarningLimit: 1024,
  },
  lint: {
    // Oxlint's defaults plus React rules, which the compiler relies on.
    plugins: ["typescript", "unicorn", "oxc", "react"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  // src/ui mirrors Devie UI byte for byte; never reformat it.
  fmt: { ignorePatterns: ["src/ui/**"] },
});
