"use client";

import type { i18n as I18nInstance } from "i18next";
import { type ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { isSupportedLocale, LANGUAGE_STORAGE_KEY } from "./locales";

interface I18nProviderProps {
  children: ReactNode;
}

function syncMetaDescription(i18n: I18nInstance) {
  let description = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (!description) {
    description = document.createElement("meta");
    description.name = "description";
    document.head.appendChild(description);
  }
  description.content = i18n.t("Metadata.Description");
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [i18n, setI18n] = useState<I18nInstance | null>(null);

  useEffect(() => {
    // Only import and initialize i18n on the client side
    import("@/i18n/i18n").then((module) => {
      setI18n(module.default);
    });
  }, []);

  useEffect(() => {
    if (!i18n) return;

    const syncDocumentLanguage = (language: string) => {
      document.documentElement.lang = language;
    };

    syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
    syncMetaDescription(i18n);

    const syncDocumentMetadata = () => syncMetaDescription(i18n);

    // The main window and the menu bar popover share localStorage; a change
    // in one window reaches the other through the storage event.
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY) return;
      if (
        isSupportedLocale(event.newValue) &&
        event.newValue !== i18n.language
      ) {
        void i18n.changeLanguage(event.newValue);
      }
    };

    i18n.on("languageChanged", syncDocumentLanguage);
    i18n.on("languageChanged", syncDocumentMetadata);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      i18n.off("languageChanged", syncDocumentLanguage);
      i18n.off("languageChanged", syncDocumentMetadata);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [i18n]);

  // Don't render children until i18n is initialized
  if (!i18n) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
