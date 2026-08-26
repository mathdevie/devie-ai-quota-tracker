import { Plus } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  if (connection.status === "ready") {
    return <Badge variant="success">{t("Connection.Status.Ready")}</Badge>;
  }
  if (connection.status === "stale") {
    return <Badge variant="warning">{t("Connection.Status.Stale")}</Badge>;
  }
  if (connection.status === "needs_login") {
    return (
      <Badge variant="warning">{t("Connection.Status.SignInNeeded")}</Badge>
    );
  }
  return <Badge variant="danger">{t("Connection.Status.Error")}</Badge>;
}

/**
 * Marks an account Devie Quota found in a CLI sign-in on this Mac. The
 * explainer offers the manual sign-in, which replaces the auto-detected one.
 */
function AutoDetectedTag({ onAuthenticate }: { onAuthenticate: () => void }) {
  const { t } = useTranslation();
  return (
    <Popover.Root>
      <Popover.Trigger className={styles.kindTag} delay={150} openOnHover>
        {t("Providers.AutoDetected")}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6}>
          <Popover.Popup className={styles.kindTip}>
            <Popover.Arrow />
            <Trans
              components={{
                link: (
                  <button
                    className={styles.kindLink}
                    onClick={onAuthenticate}
                    type="button"
                  />
                ),
              }}
              i18nKey="Providers.AutoDetectedTip"
            />
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
  const { t } = useTranslation();
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
            {t("Providers.AddAccount")}
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
                    {t("Providers.SignInWithCli")}
                  </span>
                )}
              <Switch.Root
                aria-label={t(
                  connection.enabled
                    ? "Providers.DisableAccount"
                    : "Providers.EnableAccount",
                  { name: accountLabel(connection) },
                )}
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
            <p>{t("Providers.NoAccountsYet", { name })}</p>
            <Button onClick={() => onAdd()} size="sm">
              <Plus size={14} />
              {t("Providers.AddProviderAccount", { name })}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
