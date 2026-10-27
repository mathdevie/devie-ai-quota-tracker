import { ArrowLeft, Plus, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardState, Provider, ProviderConnection } from "@/features/desktop/contracts";
import { accountLabel, isUnofficial, PROVIDER_NAMES } from "./labels";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";
import Callout from "@/ui/Callout";
import Switch from "@/ui/Switch";
import { type ConnectionActions, ConnectionMenu, SignInButton, StaleBadge } from "./ConnectionCard";
import ProviderIcon from "@/features/app-shell/ProviderIcon";
import pageStyles from "@/features/app-shell/page.module.scss";
import styles from "./ProviderDetailView.module.scss";

function ProviderStatus({
  connection,
  onSignIn,
}: {
  connection: ProviderConnection;
  onSignIn?: (connection: ProviderConnection) => void;
}) {
  const { t } = useTranslation();
  if (connection.status === "ready") {
    return <Badge variant="success">{t("Connection.Status.Ready")}</Badge>;
  }
  if (connection.status === "stale") {
    return <StaleBadge connection={connection} />;
  }
  if (connection.status === "needs_login") {
    if (onSignIn) {
      return <SignInButton connection={connection} onSignIn={onSignIn} />;
    }
    return <Badge variant="warning">{t("Connection.Status.SignInNeeded")}</Badge>;
  }
  return <Badge variant="danger">{t("Connection.Status.Error")}</Badge>;
}

function detailText(connection: ProviderConnection): string | undefined {
  const name = connection.customLabel ? connection.identity?.displayName : undefined;
  const plan = connection.identity?.plan;
  if (name && plan) return `${name} (${plan})`;
  if (plan) return `(${plan})`;
  return name;
}

export default function ProviderDetailView({
  provider,
  state,
  busyId,
  onAdd,
  onBack,
  ...actions
}: {
  provider: Provider;
  state: DashboardState;
  busyId?: string;
  onAdd: () => void;
  onBack: () => void;
} & ConnectionActions) {
  const { t } = useTranslation();
  const connections = state.connections.filter((connection) => connection.provider === provider);
  const name = PROVIDER_NAMES[provider];

  return (
    <section className={pageStyles.page}>
      <Button className={pageStyles.pageBack} onClick={onBack} size="sm" variant="naked">
        <ArrowLeft size={14} />
        {t("Providers.BackToSettings")}
      </Button>
      {isUnofficial(provider) && (
        <Callout.Root variant="warning">
          <Callout.Icon>
            <TriangleAlert size={16} />
          </Callout.Icon>
          <Callout.Content title={t("Providers.UnofficialTitle")}>
            {t("Providers.UnofficialWarning")}
          </Callout.Content>
        </Callout.Root>
      )}
      {connections.length > 0 && (
        <div className={pageStyles.toolbar}>
          <Button
            className={pageStyles.toolbarEnd}
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
                <h2>{accountLabel(connection)}</h2>
                {detailText(connection) && <p>{detailText(connection)}</p>}
                {connection.lastError && connection.status !== "ready" && (
                  <p className={styles.rowError}>{connection.lastError}</p>
                )}
              </div>
            </div>
            <div className={styles.rowActions}>
              <ProviderStatus connection={connection} onSignIn={actions.onSignIn} />
              <Switch.Root
                aria-label={t(
                  connection.enabled ? "Providers.DisableAccount" : "Providers.EnableAccount",
                  { name: accountLabel(connection) },
                )}
                checked={connection.enabled}
                disabled={busyId === connection.id}
                onCheckedChange={(checked) => actions.onEnabledChange?.(connection.id, checked)}
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
          <div className={pageStyles.emptyState}>
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
