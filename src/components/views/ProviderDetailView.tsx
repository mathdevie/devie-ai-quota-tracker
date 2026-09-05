import { ArrowLeft, Plus, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import Badge from "@/components/Badge";
import type {
  DashboardState,
  Provider,
  ProviderConnection,
} from "@/lib/contracts";
import { accountLabel, isUnofficial, PROVIDER_NAMES } from "@/lib/labels";
import Button from "@/ui/Button";
import Callout from "@/ui/Callout";
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

function detailText(connection: ProviderConnection): string | undefined {
  const name = connection.customLabel
    ? connection.identity?.displayName
    : undefined;
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
  const connections = state.connections.filter(
    (connection) => connection.provider === provider,
  );
  const name = PROVIDER_NAMES[provider];

  return (
    <section className={styles.page}>
      <Button
        className={styles.pageBack}
        onClick={onBack}
        size="sm"
        variant="naked"
      >
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
                <h2>{accountLabel(connection)}</h2>
                {detailText(connection) && <p>{detailText(connection)}</p>}
                {connection.lastError && connection.status !== "ready" && (
                  <p className={styles.rowError}>{connection.lastError}</p>
                )}
              </div>
            </div>
            <div className={styles.rowActions}>
              <ProviderStatus connection={connection} />
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
