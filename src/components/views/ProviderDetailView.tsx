import { RefreshCw, Trash2 } from "lucide-react";
import type {
  DashboardState,
  Provider,
  ProviderConnection,
} from "@/lib/contracts";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";
import Switch from "@/ui/Switch";
import ProviderIcon, { PROVIDER_NAMES } from "../ProviderIcon";
import styles from "./views.module.scss";

const CLI_HINTS: Record<Provider, string> = {
  claude: "Devie QT also lists Claude Code folders it finds on this Mac.",
  codex: "Devie QT also lists Codex folders it finds on this Mac.",
  copilot: "Devie QT also lists accounts signed in with the GitHub CLI.",
};

function ProviderStatus({ connection }: { connection: ProviderConnection }) {
  if (connection.status === "ready") {
    return <Badge variant="success">Ready</Badge>;
  }
  if (connection.status === "stale") {
    return <Badge variant="warning">Stale</Badge>;
  }
  if (connection.status === "needs_login") {
    return <Badge variant="warning">Sign-in needed</Badge>;
  }
  return <Badge variant="danger">Error</Badge>;
}

function detailText(connection: ProviderConnection): string | undefined {
  const parts = [
    connection.kind === "local" && connection.identity?.displayName,
    connection.identity?.plan,
    connection.kind === "local" ? connection.sourceLocator : undefined,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export default function ProviderDetailView({
  provider,
  state,
  busyId,
  onEnabledChange,
  onRefresh,
  onRemove,
  onAdd,
}: {
  provider: Provider;
  state: DashboardState;
  busyId?: string;
  onEnabledChange: (id: string, enabled: boolean) => void;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const connections = state.connections.filter(
    (connection) => connection.provider === provider,
  );
  const name = PROVIDER_NAMES[provider];

  return (
    <section className={styles.page}>
      <div className={styles.list}>
        {connections.map((connection) => (
          <article className={styles.row} key={connection.id}>
            <div className={styles.rowMain}>
              <ProviderIcon provider={connection.provider} />
              <div>
                <h2>
                  {connection.label}
                  {connection.kind === "local" && (
                    <span className={styles.kindTag}>CLI</span>
                  )}
                </h2>
                {detailText(connection) && <p>{detailText(connection)}</p>}
                {connection.lastError && connection.status !== "ready" && (
                  <p className={styles.rowError}>{connection.lastError}</p>
                )}
              </div>
            </div>
            <div className={styles.rowActions}>
              <ProviderStatus connection={connection} />
              {connection.kind === "local" &&
                connection.status === "needs_login" && (
                  <span className={styles.rowHint}>
                    Sign in with the CLI in a terminal.
                  </span>
                )}
              <Button
                aria-label={`Refresh ${connection.label}`}
                disabled={busyId === connection.id}
                onClick={() => onRefresh(connection.id)}
                size="sm"
                variant="icon-naked"
              >
                <RefreshCw
                  className={
                    busyId === connection.id ? styles.spinning : undefined
                  }
                  size={14}
                />
              </Button>
              {connection.kind === "oauth" && (
                <Button
                  aria-label={`Remove ${connection.label}`}
                  disabled={busyId === connection.id}
                  onClick={() => onRemove(connection.id)}
                  size="sm"
                  variant="icon-naked"
                >
                  <Trash2 size={14} />
                </Button>
              )}
              <Switch.Root
                aria-label={`${connection.enabled ? "Disable" : "Enable"} ${connection.label}`}
                checked={connection.enabled}
                disabled={busyId === connection.id}
                onCheckedChange={(checked) =>
                  onEnabledChange(connection.id, checked)
                }
              >
                <Switch.Thumb />
              </Switch.Root>
            </div>
          </article>
        ))}
        {connections.length === 0 && (
          <div className={styles.emptyState}>
            <ProviderIcon provider={provider} size={26} />
            <p>No {name} accounts yet.</p>
            <Button onClick={onAdd} size="sm">
              Add a {name} account
            </Button>
          </div>
        )}
      </div>
      <p className={styles.footnote}>{CLI_HINTS[provider]}</p>
    </section>
  );
}
