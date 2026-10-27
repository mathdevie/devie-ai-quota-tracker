import { expect, test } from "vite-plus/test";
import { formatAgo, formatDateTime, formatDate } from "@/helpers/date";

const now = Date.parse("2026-10-27T12:00:00Z");

test.each([
  [-10, "0 minutes ago"],
  [0, "0 minutes ago"],
  [45, "45 minutes ago"],
  [60, "1 hour ago"],
  [300, "5 hours ago"],
  [1440, "yesterday"],
  [2880, "2 days ago"],
])("relative time at %s minutes", (minutes, expected) => {
  expect(formatAgo(new Date(now - Number(minutes) * 60_000), "en-US", now)).toBe(expected);
});

test("relative times follow the selected language", () => {
  expect(formatAgo("2026-10-27T11:15:00Z", "fr-FR", now)).toBe("il y a 45 minutes");
});

test("dates follow the selected locale", () => {
  expect(formatDate("2026-10-27T12:00:00Z", "en-US")).toBe("October 27, 2026");
  expect(formatDate("2026-10-27T12:00:00Z", "fr-FR")).toBe("27 octobre 2026");
  expect(formatDateTime("2026-10-27T12:00:00Z", "en-US")).toBe("October 27, 2026 12:00 PM");
  expect(formatDateTime("2026-10-27T12:00:00Z", "fr-FR")).toBe("27 octobre 2026 12:00");
});
