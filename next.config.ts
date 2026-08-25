import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

// The desktop version lives in the Tauri config; Settings shows it.
const { version } = JSON.parse(
  readFileSync("src-desktop/tauri.conf.json", "utf8"),
) as { version: string };

const nextConfig: NextConfig = {
  agentRules: false,
  env: { NEXT_PUBLIC_APP_VERSION: version },
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: { overrides: { removeViewBox: false } },
                  },
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
