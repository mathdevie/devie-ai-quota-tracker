"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DashboardState,
  Provider,
  ProviderConnection,
} from "@/lib/contracts";
import { accountLabel, PROVIDER_NAMES } from "@/lib/labels";
import Select from "@/ui/Select";
import ConnectionCard, { type ConnectionActions } from "../ConnectionCard";
import styles from "./views.module.scss";

type ProviderFilter = "all" | Provider;
type Sort = "expiring" | "least-left" | "most-left" | "name";

interface Filters {
  provider: ProviderFilter;
  sort: Sort;
}

const STORAGE_KEY = "devie-quota-filters:v1";
const DEFAULT_FILTERS: Filters = { provider: "all", sort: "expiring" };

const PROVIDER_OPTIONS: { value: ProviderFilter; label: string }[] = [
  { value: "all", label: "All providers" },
  { value: "claude", label: PROVIDER_NAMES.claude },
  { value: "codex", label: PROVIDER_NAMES.codex },
  { value: "copilot", label: PROVIDER_NAMES.copilot },
];

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "expiring", label: "Expiring first" },
  { value: "least-left", label: "Least left" },
  { value: "most-left", label: "Most left" },
  { value: "name", label: "Name" },
];

function readFilters(): Filters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? { ...DEFAULT_FILTERS, ...JSON.parse(saved) }
      : DEFAULT_FILTERS;
  } catch {
    return DEFAULT_FILTERS;
  }
}

/** Minutes until the soonest reset, or Infinity without one. */
function nextReset(connection: ProviderConnection): number {
  const times = connection.windows
    .map((window) => (window.resetsAt ? Date.parse(window.resetsAt) : NaN))
    .filter((time) => !Number.isNaN(time));
  return times.length > 0 ? Math.min(...times) : Number.POSITIVE_INFINITY;
}

/** The lowest remaining percent across the windows, or 101 without data. */
function leastLeft(connection: ProviderConnection): number {
  if (connection.windows.length === 0) return 101;
  return 100 - Math.max(...connection.windows.map((w) => w.usedPercent));
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

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Select.Root
      items={options}
      onValueChange={(next) => next && onChange(next as T)}
      value={value}
    >
      <Select.Trigger aria-label={label} className={styles.filterTrigger}>
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4}>
          <Select.Popup>
            <Select.List>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  <Select.ItemIndicator />
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

export default function QuotaView({
  state,
  busyId,
  ...actions
}: {
  state: DashboardState;
  busyId?: string;
} & ConnectionActions) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    setFilters(readFilters());
  }, []);

  function update(patch: Partial<Filters>) {
    setFilters((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable
      }
      return next;
    });
  }

  const connections = useMemo(
    () =>
      state.connections
        .filter((connection) => connection.enabled)
        .filter(
          (connection) =>
            filters.provider === "all" ||
            connection.provider === filters.provider,
        )
        .sort(SORTERS[filters.sort]),
    [state.connections, filters],
  );

  return (
    <section className={styles.page} data-wide>
      <div className={styles.filters}>
        <FilterSelect
          label="Provider"
          onChange={(provider) => update({ provider })}
          options={PROVIDER_OPTIONS}
          value={filters.provider}
        />
        <FilterSelect
          label="Sort"
          onChange={(sort) => update({ sort })}
          options={SORT_OPTIONS}
          value={filters.sort}
        />
      </div>

      <div className={styles.cardGrid}>
        {connections.map((connection) => (
          <ConnectionCard
            busy={busyId === connection.id}
            connection={connection}
            key={connection.id}
            {...actions}
          />
        ))}
      </div>
      {connections.length === 0 && (
        <p className={styles.empty}>No enabled accounts</p>
      )}
    </section>
  );
}
