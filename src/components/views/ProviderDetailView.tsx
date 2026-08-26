import { Plus } from "lucide-react";
import type {
  DashboardState,
  Provider,
  ProviderConnection,
} from "@/lib/contracts";
import { accountLabel, PROVIDER_NAMES } from "@/lib/labels";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";
import Popover from "@/ui/Popover";
import Switch from "@/ui/Switch";
import { type ConnectionActions, ConnectionMenu } from "../ConnectionCard";
import ProviderIcon from "../ProviderIcon";
import styles from "./views.module.scss";

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

/**
 * Marks an account Devie Quota found in a CLI sign-in on this Mac. The
 * explainer offers the manual sign-in, which replaces the auto-detected one.
 */
function AutoDetectedTag({ onAuthenticate }: { onAuthenticate: () => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger className={styles.kindTag} delay={150} openOnHover>
        Auto-detected
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6}>
          <Popover.Popup className={styles.kindTip}>
            <Popover.Arrow />
            This account was automatically added because you are logged in from
            the CLI. For full feature support, it is recommended to{" "}
            <button
              className={styles.kindLink}
              onClick={onAuthenticate}
              type="button"
            >
              authenticate manually
            </button>
            .
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function detailText(connection: ProviderConnection): string | undefined {
  const parts = [
    connection.customLabel ? connection.identity?.displayName : undefined,
    connection.identity?.plan,
    connection.kind === "local" ? connection.sourceLocator : undefined,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export default function ProviderDetailView({
  provider,
  state,
  busyId,
  onAdd,
  ...actions
}: {
  provider: Provider;
  state: DashboardState;
  busyId?: string;
  /** Opens the sign-in; `replaces` is the auto-detected account to disable after it. */
  onAdd: (replaces?: string) => void;
} & ConnectionActions) {
  const connections = state.connections.filter(
    (connection) => connection.provider === provider,
  );
  const name = PROVIDER_NAMES[provider];

  return (
    <section className={styles.page}>
      {connections.length > 0 && (
        <div className={styles.toolbar}>
          <Button
            className={styles.toolbarEnd}
            onClick={() => onAdd()}
            size="sm"
            variant="secondary"
          >
            <Plus size={14} />
            Add account
          </Button>
        </div>
      )}
      <div className={styles.list}>
        {connections.map((connection) => (
          <article className={styles.row} key={connection.id}>
            <div className={styles.rowMain}>
              <ProviderIcon provider={connection.provider} size={28} />
              <div>
                <h2>
                  {accountLabel(connection)}
                  {connection.kind === "local" && (
                    <AutoDetectedTag
                      onAuthenticate={() => onAdd(connection.id)}
                    />
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
              <Switch.Root
                aria-label={`${connection.enabled ? "Disable" : "Enable"} ${accountLabel(connection)}`}
                checked={connection.enabled}
                disabled={busyId === connection.id}
                onCheckedChange={(checked) =>
                  actions.onEnabledChange?.(connection.id, checked)
                }
              >
                <Switch.Thumb />
              </Switch.Root>
              <ConnectionMenu
                busy={busyId === connection.id}
                connection={connection}
                onRefresh={actions.onRefresh}
                onRemove={actions.onRemove}
                onRename={actions.onRename}
                onAlerts={actions.onAlerts}
                onAutoPing={actions.onAutoPing}
              />
            </div>
          </article>
        ))}
        {connections.length === 0 && (
          <div className={styles.emptyState}>
            <ProviderIcon provider={provider} size={40} />
            <p>No {name} accounts yet.</p>
            <Button onClick={() => onAdd()} size="sm">
              <Plus size={14} />
              Add a {name} account
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
