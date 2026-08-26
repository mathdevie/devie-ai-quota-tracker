import dayjs from "dayjs";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { setLanguage } from "@/lib/desktop";
import { getDayjsLocale } from "./dayjs-locale";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LANGUAGE_STORAGE_KEY,
  type SupportedLocale,
} from "./locales";

// Import translation files
import daDK from "./messages/da-DK.json";
import deDE from "./messages/de-DE.json";
import enGB from "./messages/en-GB.json";
import enUS from "./messages/en-US.json";
import es419 from "./messages/es-419.json";
import esES from "./messages/es-ES.json";
import fiFI from "./messages/fi-FI.json";
import frFR from "./messages/fr-FR.json";
import itIT from "./messages/it-IT.json";
import nbNO from "./messages/nb-NO.json";
import nlNL from "./messages/nl-NL.json";
import ptBR from "./messages/pt-BR.json";
import svSE from "./messages/sv-SE.json";

const resources = {
  "en-US": { translation: enUS },
  "en-GB": { translation: enGB },
  "fr-FR": { translation: frFR },
  "de-DE": { translation: deDE },
  "it-IT": { translation: itIT },
  "es-ES": { translation: esES },
  "es-419": { translation: es419 },
  "pt-BR": { translation: ptBR },
  "fi-FI": { translation: fiFI },
  "da-DK": { translation: daDK },
  "nl-NL": { translation: nlNL },
  "nb-NO": { translation: nbNO },
  "sv-SE": { translation: svSE },
} satisfies Record<SupportedLocale, { translation: typeof enUS }>;

/** The saved language, else the closest supported system language. */
export const getStoredLanguage = (): SupportedLocale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLocale(stored)) return stored;
  } catch {
    // Storage unavailable
  }
  return detectSystemLanguage();
};

function detectSystemLanguage(): SupportedLocale {
  const supported = Object.keys(resources) as SupportedLocale[];
  for (const language of navigator.languages ?? [navigator.language]) {
    const exact = supported.find(
      (locale) => locale.toLowerCase() === language.toLowerCase(),
    );
    if (exact) return exact;
    const base = language.split("-")[0].toLowerCase();
    const partial = supported.find((locale) => locale.startsWith(`${base}-`));
    if (partial) return partial;
  }
  return DEFAULT_LOCALE;
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: DEFAULT_LOCALE,
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    // React to language changes
    react: {
      useSuspense: false,
    },
  });

// Save language changes to localStorage
i18n.on("languageChanged", (lng) => {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(LANGUAGE_STORAGE_KEY) !== lng) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    }
  } catch {
    // Storage unavailable
  }
});

// Dates follow the interface language.
i18n.on("languageChanged", (lng) => {
  dayjs.locale(getDayjsLocale(lng));
});
dayjs.locale(getDayjsLocale(i18n.language));

// The tray menu and notifications follow the interface language.
i18n.on("languageChanged", (lng) => {
  setLanguage(lng).catch((reason) => console.error(reason));
});
setLanguage(i18n.language).catch((reason) => console.error(reason));

export default i18n;
