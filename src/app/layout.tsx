import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/ui/themes/ThemeContext";
import "@/ui/_themes.scss";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Devie QT",
  description: "A local AI subscription quota tracker",
};

const themeBootScript = `(() => {
  try {
    const key = "devie-qt-theme:v1";
    const allowed = new Set([
      "theme-default", "theme-dark", "theme-midnight-ink",
      "theme-copper-sunset", "theme-aurora-green", "theme-sharingan",
      "theme-alpine-snow", "theme-command-prompt", "theme-totoro",
      "theme-catpuccin-latte"
    ]);
    const saved = localStorage.getItem(key);
    document.documentElement.dataset.devieTheme = allowed.has(saved)
      ? saved
      : "theme-default";
  } catch {
    document.documentElement.dataset.devieTheme = "theme-default";
  }
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-devie-theme="theme-default" lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: This static script prevents a theme flash before hydration. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
