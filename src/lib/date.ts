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

/**
 * "45 minutes ago", "5 hours ago", or "yesterday", in the interface
 * language. Under an hour it counts minutes, under a day hours, then days.
 */
export function formatAgo(
  value: string | Date,
  locale: string,
  now: number = Date.now(),
): string {
  const minutes = Math.max(0, (now - new Date(value).getTime()) / 60_000);
  if (minutes < 60) {
    const format = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
    return format.format(-Math.round(minutes), "minute");
  }
  if (minutes < 1440) {
    const format = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
    return format.format(-Math.round(minutes / 60), "hour");
  }
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return format.format(-Math.round(minutes / 1440), "day");
}
