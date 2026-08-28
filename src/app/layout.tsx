import type { Metadata } from "next";
import type { ReactNode } from "react";
import I18nProvider from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/ui/themes/ThemeContext";
import "@/ui/_themes.scss";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Devie Quota",
  description: "A local AI subscription quota tracker",
};

const themeBootScript = `(() => {
  try {
    const key = "devie-quota-theme:v1";
    const allowed = new Set([
      "system", "theme-light", "theme-dark", "theme-midnight-ink",
      "theme-copper-sunset", "theme-aurora-green", "theme-sharingan",
      "theme-alpine-snow", "theme-command-prompt", "theme-totoro",
      "theme-catpuccin-latte"
    ]);
    const system = () => matchMedia("(prefers-color-scheme: dark)").matches
      ? "theme-dark"
      : "theme-light";
    let saved = localStorage.getItem(key);
    if (saved === "theme-default") saved = "theme-light";
    if (!allowed.has(saved)) saved = "system";
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
