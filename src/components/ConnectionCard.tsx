import { Ellipsis, Pencil, Power, RefreshCw, Trash2 } from "lucide-react";
import type { ProviderConnection } from "@/lib/contracts";
import { accountLabel, fullName, PROVIDER_NAMES } from "@/lib/labels";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";
import Menu from "@/ui/Menu";
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

export interface ConnectionActions {
  onRefresh?: (id: string) => void;
  onRename?: (connection: ProviderConnection) => void;
  onEnabledChange?: (id: string, enabled: boolean) => void;
  onRemove?: (id: string) => void;
}

/** The "three dots" menu with every action for one account. */
export function ConnectionMenu({
  connection,
  busy = false,
  onRefresh,
  onRename,
  onEnabledChange,
  onRemove,
}: { connection: ProviderConnection; busy?: boolean } & ConnectionActions) {
  const name = fullName(connection);
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            aria-label={`Actions for ${name}`}
            disabled={busy}
            size="sm"
            variant="icon-naked"
          />
        }
      >
        <Ellipsis size={15} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={4}>
          <Menu.Popup className={styles.menu}>
            {onRename && (
              <Menu.Item onClick={() => onRename(connection)}>
                <Pencil size={14} />
                Rename
              </Menu.Item>
            )}
            {onRefresh && (
              <Menu.Item onClick={() => onRefresh(connection.id)}>
                <RefreshCw size={14} />
                Refresh
              </Menu.Item>
            )}
            {onEnabledChange && (
              <Menu.Item
                onClick={() =>
                  onEnabledChange(connection.id, !connection.enabled)
                }
              >
                <Power size={14} />
                {connection.enabled ? "Disable" : "Enable"}
              </Menu.Item>
            )}
            {onRemove && connection.kind === "oauth" && (
              <>
                <Menu.Separator />
                <Menu.Item
                  className={styles.dangerItem}
                  onClick={() => onRemove(connection.id)}
                >
                  <Trash2 size={14} />
                  Remove
                </Menu.Item>
              </>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export default function ConnectionCard({
  connection,
  compact = false,
  busy = false,
  ...actions
}: {
  connection: ProviderConnection;
  compact?: boolean;
  busy?: boolean;
} & ConnectionActions) {
  const hasActions = Object.values(actions).some(Boolean);
  const plan = connection.identity?.plan;

  return (
    <article className={styles.card} data-compact={compact || undefined}>
      <header className={styles.header}>
        <ProviderIcon provider={connection.provider} size={compact ? 16 : 18} />
        <div className={styles.identity}>
          <h2>{PROVIDER_NAMES[connection.provider]}</h2>
          <p>
            {accountLabel(connection)}
            {plan && <span className={styles.plan}> · {plan}</span>}
          </p>
        </div>
        <StatusBadge connection={connection} />
        {busy && <RefreshCw className={styles.spinning} size={13} />}
        {hasActions && !compact && (
          <ConnectionMenu busy={busy} connection={connection} {...actions} />
        )}
      </header>

      {connection.windows.length > 0 ? (
        <div className={styles.windows}>
          {connection.windows.map((window) => {
            const left = Math.max(0, Math.round(100 - window.usedPercent));
            return (
              <div className={styles.window} key={window.key}>
                <span className={styles.dot} />
                <span className={styles.label} title={window.label}>
                  {window.label}
                </span>
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
