import { Toast } from "@base-ui/react/toast";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppShell from "@/components/AppShell";
import I18nProvider from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeContext";
import { Toaster } from "@/ui/Toaster";
import "@/ui/themes/default.css";
import "@/ui/themes/desktop.scss";
import "@/theme/light/theme.css";
import "@/theme/dark/theme.css";
import "@/ui/themes/midnight-ink/theme.css";
import "@/ui/themes/copper-sunset/theme.css";
import "@/ui/themes/aurora-green/theme.css";
import "@/ui/themes/sharingan/theme.css";
import "@/ui/themes/alpine-snow/theme.css";
import "@/ui/themes/command-prompt/theme.css";
import "@/ui/themes/totoro/theme.css";
import "@/ui/themes/catppuccin-latte/theme.css";
import "./globals.scss";
import "@/theme/desktop.scss";

const root = document.getElementById("root");
if (!root) throw new Error("Missing app root");

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <Toast.Provider timeout={6000}>
          <div className="appRoot">
            <AppShell />
          </div>
          <Toaster />
        </Toast.Provider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
