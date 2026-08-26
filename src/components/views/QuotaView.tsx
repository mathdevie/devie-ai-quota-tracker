"use client";

import { Plug, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DashboardState } from "@/lib/contracts";
import { broadcastFilters } from "@/lib/desktop";
import {
  applyFilters,
  DEFAULT_FILTERS,
  type Filters,
  PROVIDER_OPTIONS,
  readFilters,
  SORT_OPTIONS,
  writeFilters,
} from "@/lib/filters";
import Button from "@/ui/Button";
import Select from "@/ui/Select";
import ConnectionCard, { type ConnectionActions } from "../ConnectionCard";
import styles from "./views.module.scss";

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
  refreshing = false,
  onRefreshAll,
  onOpenProviders,
  ...actions
}: {
  state: DashboardState;
  busyId?: string;
  refreshing?: boolean;
  onRefreshAll: () => void;
  onOpenProviders: () => void;
} & ConnectionActions) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    setFilters(readFilters());
  }, []);

  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    writeFilters(next);
    void broadcastFilters(next);
  }

  const connections = useMemo(
    () => applyFilters(state.connections, filters),
    [state.connections, filters],
  );
  const hasAccounts = state.connections.length > 0;

  return (
    <section className={styles.page} data-wide>
      <div className={styles.toolbar}>
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
        <Button
          className={styles.toolbarEnd}
          disabled={refreshing}
          onClick={onRefreshAll}
          size="sm"
          variant="secondary"
        >
          <RefreshCw
            className={refreshing ? styles.spinning : undefined}
            size={14}
          />
          Refresh
        </Button>
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
        <div className={styles.emptyState}>
          <p>
            {hasAccounts
              ? "No enabled account matches these filters."
              : "No accounts yet. Connect a provider to see its quotas."}
          </p>
          <Button onClick={onOpenProviders} size="sm">
            <Plug size={14} />
            Open Providers
          </Button>
        </div>
      )}
    </section>
  );
}
