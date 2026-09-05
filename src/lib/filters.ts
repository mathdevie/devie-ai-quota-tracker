import type { Provider, ProviderConnection } from "./contracts";
import { accountLabel, PROVIDER_NAMES, visibleWindows } from "./labels";

export type ProviderFilter = "all" | Provider;
export type Sort = "expiring" | "least-left" | "most-left" | "name";

export interface Filters {
  provider: ProviderFilter;
  sort: Sort;
}

/** The main window and the menu bar popover each keep their own filters. */
export type FilterScope = "main" | "popover";

const STORAGE_KEYS: Record<FilterScope, string> = {
  main: "devie-quota-filters:v1",
  popover: "devie-quota-popover-filters:v1",
};

export const DEFAULT_FILTERS: Filters = { provider: "all", sort: "expiring" };

/** In menu order. The labels live in the locale files. */
export const PROVIDER_FILTERS: ProviderFilter[] = [
  "all",
  "claude",
  "codex",
  "gemini-cli",
  "antigravity",
  "copilot",
  "cursor",
];

export const SORTS: Sort[] = ["expiring", "least-left", "most-left", "name"];

export function readFilters(scope: FilterScope): Filters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    // The popover starts from the main filters: both shared one key before.
    const saved =
      localStorage.getItem(STORAGE_KEYS[scope]) ??
      localStorage.getItem(STORAGE_KEYS.main);
    return saved
      ? { ...DEFAULT_FILTERS, ...JSON.parse(saved) }
      : DEFAULT_FILTERS;
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function writeFilters(scope: FilterScope, filters: Filters): void {
  try {
    localStorage.setItem(STORAGE_KEYS[scope], JSON.stringify(filters));
  } catch {
    // Storage unavailable
  }
}

/** Minutes until the soonest reset, or Infinity without one. */
function nextReset(connection: ProviderConnection): number {
  const times = visibleWindows(connection)
    .map((window) => (window.resetsAt ? Date.parse(window.resetsAt) : NaN))
    .filter((time) => !Number.isNaN(time));
  return times.length > 0 ? Math.min(...times) : Number.POSITIVE_INFINITY;
}

/** The lowest remaining percent across the shown windows, or 101 without data. */
function leastLeft(connection: ProviderConnection): number {
  const windows = visibleWindows(connection).filter(
    (w) => !w.paid && !w.unlimited,
  );
  if (windows.length === 0) return 101;
  return 100 - Math.max(...windows.map((w) => w.usedPercent));
}

const SORTERS: Record<
  Sort,
  (a: ProviderConnection, b: ProviderConnection) => number
> = {
  expiring: (a, b) => nextReset(a) - nextReset(b),
  "least-left": (a, b) => leastLeft(a) - leastLeft(b),
  "most-left": (a, b) => leastLeft(b) - leastLeft(a),
  name: (a, b) =>
    `${PROVIDER_NAMES[a.provider]} ${accountLabel(a)}`.localeCompare(
      `${PROVIDER_NAMES[b.provider]} ${accountLabel(b)}`,
    ),
};

/** Enabled accounts that match the provider filter, in the chosen order. */
export function applyFilters(
  connections: ProviderConnection[],
  filters: Filters,
): ProviderConnection[] {
  return connections
    .filter((connection) => connection.enabled)
    .filter(
      (connection) =>
        filters.provider === "all" || connection.provider === filters.provider,
    )
    .sort(SORTERS[filters.sort]);
}
