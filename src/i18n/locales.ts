import type { TFunction } from "i18next";

export const SUPPORTED_LOCALES = [
  "da-DK",
  "de-DE",
  "en-GB",
  "en-US",
  "es-419",
  "es-ES",
  "fi-FI",
  "fr-FR",
  "it-IT",
  "nb-NO",
  "nl-NL",
  "pt-BR",
  "sv-SE",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en-US";
/** Shared by the main window and the menu bar popover (same origin). */
export const LANGUAGE_STORAGE_KEY = "devie-quota-language:v1";

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export function getLocaleEndonym(locale: string, t: TFunction): string {
  return t("_Meta.EndonymName", { lng: locale, defaultValue: locale });
}

export function getSortedLocaleOptions(t: TFunction, activeLocale: string) {
  return SUPPORTED_LOCALES.map((locale) => ({
    value: locale,
    endonym: getLocaleEndonym(locale, t),
  })).sort((a, b) => a.endonym.localeCompare(b.endonym, activeLocale));
}
