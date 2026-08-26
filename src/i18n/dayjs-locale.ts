import "dayjs/locale/da";
import "dayjs/locale/de";
import "dayjs/locale/en";
import "dayjs/locale/en-gb";
import "dayjs/locale/es";
import "dayjs/locale/es-mx";
import "dayjs/locale/fi";
import "dayjs/locale/fr";
import "dayjs/locale/it";
import "dayjs/locale/nb";
import "dayjs/locale/nl";
import "dayjs/locale/pt-br";
import "dayjs/locale/sv";
import type { SupportedLocale } from "./locales";

const DAYJS_LOCALE: Record<SupportedLocale, string> = {
  "da-DK": "da",
  "de-DE": "de",
  "en-GB": "en-gb",
  "en-US": "en",
  "es-419": "es-mx",
  "es-ES": "es",
  "fi-FI": "fi",
  "fr-FR": "fr",
  "it-IT": "it",
  "nb-NO": "nb",
  "nl-NL": "nl",
  "pt-BR": "pt-br",
  "sv-SE": "sv",
};

const DAYJS_LOCALE_BY_LANGUAGE: Record<string, string> = Object.fromEntries(
  Object.entries(DAYJS_LOCALE).map(([locale, dayjsLocale]) => [
    locale.split("-")[0],
    dayjsLocale,
  ]),
);

/** The Day.js locale for an interface language, "en" when unknown. */
export function getDayjsLocale(locale: string | undefined): string {
  if (!locale) return "en";
  return (
    DAYJS_LOCALE[locale as SupportedLocale] ??
    DAYJS_LOCALE_BY_LANGUAGE[locale.split("-")[0].toLowerCase()] ??
    "en"
  );
}
