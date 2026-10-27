"use client";

import { Plug, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardState } from "@/features/desktop/contracts";
import { applyFilters, DEFAULT_FILTERS, type Filters, readFilters, writeFilters } from "./filters";
import Button from "@/ui/Button";
import ConnectionCard, { type ConnectionActions } from "@/features/connections/ConnectionCard";
import QuotaFilters from "./QuotaFilters";
import pageStyles from "@/features/app-shell/page.module.scss";
import styles from "./QuotaView.module.scss";

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

  useEffect(() => {
    setFilters(readFilters("main"));
  }, []);

  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    writeFilters("main", next);
  }

  const connections = useMemo(
    () => applyFilters(state.connections, filters),
    [state.connections, filters],
  );
  const hasAccounts = state.connections.length > 0;

  return (
    <section className={pageStyles.page} data-wide>
      <div className={pageStyles.toolbar}>
        <QuotaFilters filters={filters} onChange={update} />
        <Button
          className={pageStyles.toolbarEnd}
          disabled={refreshing}
          onClick={onRefreshAll}
          size="sm"
          variant="secondary"
        >
          <RefreshCw className={refreshing ? pageStyles.spinning : undefined} size={14} />
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
        <div className={pageStyles.emptyState}>
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
