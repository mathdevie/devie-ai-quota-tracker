import { Clock3 } from "lucide-react";
import type { ProviderConnection, QuotaWindow } from "@/lib/contracts";
import Badge from "@/ui/Badge";
import Progress from "@/ui/Progress";
import styles from "./ConnectionCard.module.scss";
import ProviderIcon from "./ProviderIcon";

function resetText(window: QuotaWindow): string | undefined {
  if (!window.resetsAt) return undefined;
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(window.resetsAt));
}

function StatusBadge({ connection }: { connection: ProviderConnection }) {
  if (connection.status === "ready") return null;
  if (connection.status === "stale") {
    return <Badge variant="warning">Stale</Badge>;
  }
  if (connection.status === "needs_login") {
    return <Badge variant="warning">Login required</Badge>;
  }
  return <Badge variant="danger">Error</Badge>;
}

export default function ConnectionCard({
  connection,
  compact = false,
}: {
  connection: ProviderConnection;
  compact?: boolean;
}) {
  const windows = compact ? connection.windows.slice(0, 2) : connection.windows;

  return (
    <article className={styles.card} data-compact={compact || undefined}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <ProviderIcon provider={connection.provider} />
          <div>
            <h2>{connection.label}</h2>
            {connection.identity?.plan && <p>{connection.identity.plan}</p>}
          </div>
        </div>
        <StatusBadge connection={connection} />
      </header>

      {windows.length > 0 ? (
        <div className={styles.windows}>
          {windows.map((window) => {
            const reset = resetText(window);
            return (
              <Progress.Root key={window.key} value={window.usedPercent}>
                <div className={styles.progressMeta}>
                  <Progress.Label>{window.label}</Progress.Label>
                  <span>{Math.round(100 - window.usedPercent)}% left</span>
                </div>
                <Progress.Track>
                  <Progress.Indicator
                    className={
                      window.usedPercent >= 85
                        ? styles.danger
                        : window.usedPercent >= 65
                          ? styles.warning
                          : undefined
                    }
                  />
                </Progress.Track>
                {reset && (
                  <span className={styles.reset}>
                    <Clock3 aria-hidden size={12} />
                    {reset}
                  </span>
                )}
              </Progress.Root>
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
