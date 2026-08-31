import type { Metadata } from "next";
import type { ReactNode } from "react";
import I18nProvider from "@/i18n/I18nProvider";
import { THEMES } from "@/theme/registry";
import { ThemeProvider } from "@/theme/ThemeContext";
import "@/ui/themes/default.css";
import "@/theme/light/theme.css";
import "@/theme/dark/theme.css";
import "@/ui/themes/midnight-ink/theme.css";
import "@/ui/themes/copper-sunset/theme.css";
import "@/ui/themes/aurora-green/theme.css";
import "@/ui/themes/sharingan/theme.css";
import "@/ui/themes/alpine-snow/theme.css";
import "@/ui/themes/command-prompt/theme.css";
import "@/ui/themes/totoro/theme.css";
import "@/ui/themes/catpuccin-latte/theme.css";
import "./globals.scss";
import "./macos.scss";
import "@/theme/custom-themes.css";

export const metadata: Metadata = {
  title: "Devie Quota",
  description: "A local AI subscription quota tracker",
};

const themeBootScript = `(() => {
  try {
    const key = "devie-quota-theme:v1";
    const allowed = new Set(${JSON.stringify(THEMES.map((theme) => theme.className))});
    const system = () => matchMedia("(prefers-color-scheme: dark)").matches
      ? "theme-dark"
      : "theme-light";
    let saved = localStorage.getItem(key);
    if (saved === "theme-default") saved = "theme-light";
    if (!allowed.has(saved)) {
      saved = "system";
      localStorage.setItem(key, saved);
    }
    document.documentElement.dataset.devieTheme =
      saved === "system" ? system() : saved;
  } catch {
    document.documentElement.dataset.devieTheme = "theme-light";
  }
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-devie-theme="theme-light" lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: This static script prevents a theme flash before hydration. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <I18nProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
