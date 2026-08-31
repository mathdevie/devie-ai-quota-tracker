"use client";

import clsx from "clsx";
import { ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  type Filters,
  PROVIDER_FILTERS,
  SORTS,
  type Sort,
} from "@/lib/filters";
import { PROVIDER_NAMES } from "@/lib/labels";
import Select from "@/ui/Select";
import IconTip from "./IconTip";
import ProviderIcon from "./ProviderIcon";
import styles from "./QuotaFilters.module.scss";

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
  compact,
  compactIcon,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
  /** An icon-only trigger with a tooltip, for the menu bar popover header. */
  compact?: boolean;
  /** Shown on the compact trigger when the options carry no icon. */
  compactIcon?: ReactNode;
}) {
  const selected = options.find((option) => option.value === value);
  const trigger = (
    <Select.Trigger
      aria-label={label}
      className={clsx(styles.trigger, compact && styles.compact)}
    >
      {compact ? (
        (selected?.icon ?? compactIcon)
      ) : (
        <>
          {selected?.icon}
          <Select.Value />
        </>
      )}
      <Select.Icon />
    </Select.Trigger>
  );
  return (
    <Select.Root
      items={options}
      onValueChange={(next) => next && onChange(next as T)}
      value={value}
    >
      {compact ? <IconTip label={label}>{trigger}</IconTip> : trigger}
      <Select.Portal>
        <Select.Positioner
          alignItemWithTrigger={false}
          side="bottom"
          sideOffset={4}
        >
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

/** The provider filter and the sort order for one quota list. */
export default function QuotaFilters({
  filters,
  onChange,
  compact = false,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const providerOptions = PROVIDER_FILTERS.map((value) => ({
    value,
    label: value === "all" ? t("Quota.AllProviders") : PROVIDER_NAMES[value],
    icon:
      value === "all" ? undefined : <ProviderIcon provider={value} size={16} />,
  }));
  const sortOptions = SORTS.map((value) => ({
    value,
    label: t(SORT_LABELS[value]),
  }));

  return (
    <>
      <FilterSelect
        compact={compact}
        label={t("Quota.FilterProvider")}
        onChange={(provider) => onChange({ provider })}
        options={providerOptions}
        value={filters.provider}
      />
      <FilterSelect
        compact={compact}
        compactIcon={<ArrowUpDown className={styles.sortMark} size={16} />}
        label={t("Quota.FilterSort")}
        onChange={(sort) => onChange({ sort })}
        options={sortOptions}
        value={filters.sort}
      />
    </>
  );
}
