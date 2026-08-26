import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { getDayjsLocale } from "@/i18n/dayjs-locale";

dayjs.extend(localizedFormat);

/**
 * A full date with time in the interface language, for example
 * "September 4, 2026 4:00 PM" or "4 septembre 2026 16:00".
 */
export function formatDateTime(value: string | Date, locale: string): string {
  return dayjs(value).locale(getDayjsLocale(locale)).format("LLL");
}

/** A full date without time, for example "September 4, 2026". */
export function formatDate(value: string | Date, locale: string): string {
  return dayjs(value).locale(getDayjsLocale(locale)).format("LL");
}
