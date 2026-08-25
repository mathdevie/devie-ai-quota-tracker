import {
  Bot,
  Braces,
  Clock3,
  GitPullRequest,
  Radio,
  TriangleAlert,
} from "lucide-react";
import type { ProviderConnection, QuotaWindow } from "@/lib/contracts";
import Badge from "@/ui/Badge";
import Progress from "@/ui/Progress";
import styles from "./ConnectionCard.module.scss";

const providerNames = {
  claude: "Claude",
  codex: "Codex",
  copilot: "GitHub Copilot",
};

function ProviderIcon({ provider }: Pick<ProviderConnection, "provider">) {
  const Icon =
    provider === "claude"
      ? Bot
      : provider === "codex"
        ? Braces
        : GitPullRequest;
  return (
    <span className={styles.providerIcon} data-provider={provider}>
      <Icon aria-hidden size={18} strokeWidth={2.2} />
    </span>
  );
}

function resetText(window: QuotaWindow): string {
  if (!window.resetsAt) return "Reset time unavailable";
  const date = new Date(window.resetsAt);
  return `Resets ${new Intl.DateTimeFormat("en", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)}`;
}

function statusBadge(connection: ProviderConnection) {
  if (connection.status === "ready") {
    return <Badge variant="success">Live</Badge>;
  }
  if (connection.status === "stale") {
    return <Badge variant="warning">Stale</Badge>;
  }
  if (connection.status === "needs_login") {
    return <Badge variant="warning">Login needed</Badge>;
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
  const visibleWindows = compact
    ? connection.windows.slice(0, 2)
    : connection.windows;

  return (
    <article className={styles.card} data-compact={compact || undefined}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <ProviderIcon provider={connection.provider} />
          <div>
            <h3>{connection.label}</h3>
            <p>
              {providerNames[connection.provider]}
              {connection.identity?.plan
                ? ` · ${connection.identity.plan}`
                : ""}
            </p>
          </div>
        </div>
        {statusBadge(connection)}
      </header>

      {connection.lastError && (
        <div className={styles.error}>
          <TriangleAlert aria-hidden size={15} />
          <span>{connection.lastError}</span>
        </div>
      )}

      <div className={styles.windows}>
        {visibleWindows.length === 0 ? (
          <div className={styles.emptyWindow}>
            <Radio aria-hidden size={17} />
            <span>Refresh this connection to load its quota.</span>
          </div>
        ) : (
          visibleWindows.map((window) => (
            <Progress.Root key={window.key} value={window.usedPercent}>
              <div className={styles.progressMeta}>
                <Progress.Label>{window.label}</Progress.Label>
                <span className={styles.progressValue}>
                  {Math.round(window.usedPercent)}% used
                </span>
              </div>
              <Progress.Track>
                <Progress.Indicator
                  className={
                    window.usedPercent >= 85
                      ? styles.progressDanger
                      : window.usedPercent >= 65
                        ? styles.progressWarning
                        : undefined
                  }
                />
              </Progress.Track>
              <span className={styles.reset}>
                <Clock3 aria-hidden size={12} />
                {resetText(window)}
              </span>
            </Progress.Root>
          ))
        )}
      </div>

      {!compact && (
        <footer className={styles.footer}>
          <span>{connection.source}</span>
          <code>{connection.sourceLocator}</code>
        </footer>
      )}
    </article>
  );
}
