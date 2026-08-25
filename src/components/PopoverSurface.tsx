import { RefreshCw } from "lucide-react";
import type { DashboardState, ProviderConnection } from "@/lib/contracts";
import { openMainWindow } from "@/lib/desktop";
import Button from "@/ui/Button";
import ConnectionCard from "./ConnectionCard";
import styles from "./PopoverSurface.module.scss";

function remainingPercent(connection: ProviderConnection): number | undefined {
  if (connection.windows.length === 0) return undefined;
  return Math.max(
    0,
    100 - Math.max(...connection.windows.map((window) => window.usedPercent)),
  );
}

function latestUpdate(state: DashboardState): string {
  if (!state.refreshedAt) return "Not updated";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(state.refreshedAt));
}

export default function PopoverSurface({
  state,
  refreshing,
  onRefresh,
}: {
  state: DashboardState;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const enabled = state.connections.filter((connection) => connection.enabled);
  const remaining = enabled
    .map(remainingPercent)
    .filter((value): value is number => value !== undefined);
  const lowest = remaining.length > 0 ? Math.min(...remaining) : undefined;

  return (
    <main className={styles.popover}>
      <header className={styles.header} data-tauri-drag-region>
        <strong>Quotas</strong>
        <div className={styles.actions}>
          <span className={styles.minimum}>
            {lowest === undefined ? "—" : `${Math.round(lowest)}% left`}
          </span>
          <Button
            aria-label="Refresh quotas"
            disabled={refreshing}
            onClick={onRefresh}
            size="sm"
            variant="icon-naked"
          >
            <RefreshCw
              className={refreshing ? styles.spinning : undefined}
              size={14}
            />
          </Button>
        </div>
      </header>

      <section className={styles.list}>
        {enabled.map((connection) => (
          <ConnectionCard compact connection={connection} key={connection.id} />
        ))}
        {enabled.length === 0 && <p className={styles.empty}>No providers</p>}
      </section>

      <footer className={styles.footer}>
        <span>Updated {latestUpdate(state)}</span>
        <Button onClick={() => void openMainWindow()} size="sm" variant="naked">
          Open Devie Quota
        </Button>
      </footer>
    </main>
  );
}
