import { RefreshCw } from "lucide-react";
import type { ProviderConnection, QuotaWindow } from "@/lib/contracts";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";
import styles from "./ConnectionCard.module.scss";
import ProviderIcon from "./ProviderIcon";

/** "in 4h 13m", "in 6d 4h", or "now" for a past reset. */
export function untilText(value?: string): string | undefined {
  if (!value) return undefined;
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);
  if (minutes <= 0) return "now";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${rest}m`;
  return `in ${rest}m`;
}

export function subtitle(connection: ProviderConnection): string | undefined {
  const parts = [connection.identity?.displayName, connection.identity?.plan];
  const text = parts.filter(Boolean).join(" · ");
  return text || undefined;
}

function tone(window: QuotaWindow): "ok" | "warn" | "danger" {
  if (window.usedPercent >= 85) return "danger";
  if (window.usedPercent >= 65) return "warn";
  return "ok";
}

function StatusBadge({ connection }: { connection: ProviderConnection }) {
  if (connection.status === "ready") return null;
  if (connection.status === "stale") {
    return <Badge variant="warning">Stale</Badge>;
  }
  if (connection.status === "needs_login") {
    return <Badge variant="warning">Login</Badge>;
  }
  return <Badge variant="danger">Error</Badge>;
}

export default function ConnectionCard({
  connection,
  compact = false,
  busy = false,
  onRefresh,
}: {
  connection: ProviderConnection;
  compact?: boolean;
  busy?: boolean;
  onRefresh?: (id: string) => void;
}) {
  const sub = subtitle(connection);

  return (
    <article className={styles.card} data-compact={compact || undefined}>
      <header className={styles.header}>
        <ProviderIcon provider={connection.provider} size={compact ? 16 : 20} />
        <div className={styles.identity}>
          <h2>{connection.label}</h2>
          {sub && <p>{sub}</p>}
        </div>
        <StatusBadge connection={connection} />
        {onRefresh && (
          <Button
            aria-label={`Refresh ${connection.label}`}
            disabled={busy}
            onClick={() => onRefresh(connection.id)}
            size="sm"
            variant="icon-naked"
          >
            <RefreshCw
              className={busy ? styles.spinning : undefined}
              size={13}
            />
          </Button>
        )}
      </header>

      {connection.windows.length > 0 ? (
        <div className={styles.windows}>
          {connection.windows.map((window) => {
            const left = Math.max(0, Math.round(100 - window.usedPercent));
            return (
              <div
                className={styles.window}
                data-tone={tone(window)}
                key={window.key}
              >
                <span className={styles.dot} />
                <span className={styles.label}>{window.label}</span>
                <span className={styles.track}>
                  <span
                    className={styles.fill}
                    style={{ width: `${Math.min(100, left)}%` }}
                  />
                </span>
                <span className={styles.percent}>{left}%</span>
                <span className={styles.reset}>
                  {untilText(window.resetsAt) ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.empty}>
          {connection.lastError ?? "No quota data"}
        </p>
      )}
    </article>
  );
}
