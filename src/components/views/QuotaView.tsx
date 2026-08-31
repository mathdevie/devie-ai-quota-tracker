"use client";

import { Plug, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardState } from "@/lib/contracts";
import { broadcastFilters } from "@/lib/desktop";
import {
  applyFilters,
  DEFAULT_FILTERS,
  type Filters,
  PROVIDER_FILTERS,
  readFilters,
  SORTS,
  type Sort,
  writeFilters,
} from "@/lib/filters";
import { PROVIDER_NAMES } from "@/lib/labels";
import Button from "@/ui/Button";
import Select from "@/ui/Select";
import ConnectionCard, { type ConnectionActions } from "../ConnectionCard";
import ProviderIcon from "../ProviderIcon";
import styles from "./views.module.scss";

const SORT_LABELS: Record<Sort, string> = {
  expiring: "Quota.Sort.Expiring",
  "least-left": "Quota.Sort.LeastLeft",
  "most-left": "Quota.Sort.MostLeft",
  name: "Quota.Sort.Name",
};

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
}) {
  const selected = options.find((option) => option.value === value);
  return (
    <Select.Root
      items={options}
      onValueChange={(next) => next && onChange(next as T)}
      value={value}
    >
      <Select.Trigger aria-label={label} className={styles.filterTrigger}>
        {selected?.icon}
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
                  {option.icon}
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
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const providerOptions = PROVIDER_FILTERS.map((value) => ({
    value,
    label: value === "all" ? t("Quota.AllProviders") : PROVIDER_NAMES[value],
    icon:
      value === "all" ? (
        <Plug className={styles.filterAllMark} size={16} />
      ) : (
        <ProviderIcon provider={value} size={16} />
      ),
  }));
  const sortOptions = SORTS.map((value) => ({
    value,
    label: t(SORT_LABELS[value]),
  }));

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
          label={t("Quota.FilterProvider")}
          onChange={(provider) => update({ provider })}
          options={providerOptions}
          value={filters.provider}
        />
        <FilterSelect
          label={t("Quota.FilterSort")}
          onChange={(sort) => update({ sort })}
          options={sortOptions}
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
          {t("Common.Refresh")}
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
          <p>{hasAccounts ? t("Quota.NoMatch") : t("Quota.NoAccounts")}</p>
          <Button onClick={onOpenProviders} size="sm">
            <Plug size={14} />
            {t("Quota.OpenProviders")}
          </Button>
        </div>
      )}
    </section>
  );
}
