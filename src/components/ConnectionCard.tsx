import {
  BellRing,
  Ellipsis,
  Pencil,
  Power,
  RefreshCw,
  Trash2,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProviderConnection } from "@/lib/contracts";
import { accountLabel, fullName, PROVIDER_NAMES } from "@/lib/labels";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";
import Menu from "@/ui/Menu";
import styles from "./ConnectionCard.module.scss";
import IconTip from "./IconTip";
import ProviderIcon from "./ProviderIcon";
import QuotaBars from "./QuotaBars";

export function StatusBadge({
  connection,
}: {
  connection: ProviderConnection;
}) {
  const { t } = useTranslation();
  if (connection.status === "ready") return null;
  if (connection.status === "stale") {
    return <Badge variant="warning">{t("Connection.Status.Stale")}</Badge>;
  }
  if (connection.status === "needs_login") {
    return <Badge variant="warning">{t("Connection.Status.Login")}</Badge>;
  }
  return <Badge variant="danger">{t("Connection.Status.Error")}</Badge>;
}

export interface ConnectionActions {
  onRefresh?: (id: string) => void;
  onRename?: (connection: ProviderConnection) => void;
  onAlerts?: (connection: ProviderConnection) => void;
  onAutoPing?: (connection: ProviderConnection) => void;
  onEnabledChange?: (id: string, enabled: boolean) => void;
  onRemove?: (id: string) => void;
}

/** "On" or "Off" at the end of a menu item. */
function MenuState({ on }: { on: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={styles.menuState} data-on={on || undefined}>
      {on ? t("Connection.Menu.On") : t("Connection.Menu.Off")}
    </span>
  );
}

/** True when at least one alert is on. */
function alertsOn(connection: ProviderConnection): boolean {
  return Object.values(connection.alerts).some(Boolean);
}

/**
 * Alert and Quota Optimizer shortcuts in the card header. An active feature
 * always shows; an inactive one shows on hover.
 */
function FeatureFlags({
  connection,
  onAlerts,
  onAutoPing,
}: {
  connection: ProviderConnection;
  onAlerts?: (connection: ProviderConnection) => void;
  onAutoPing?: (connection: ProviderConnection) => void;
}) {
  const { t } = useTranslation();
  const alerts = alertsOn(connection);
  const optimizer = connection.autoPing.enabled;
  return (
    <div className={styles.flags}>
      {onAlerts && (
        <IconTip label={t("Connection.Menu.Alerts")}>
          <button
            aria-label={t("Connection.Menu.Alerts")}
            aria-pressed={alerts}
            className={styles.flag}
            data-active={alerts || undefined}
            onClick={() => onAlerts(connection)}
            type="button"
          >
            <BellRing size={13} />
          </button>
        </IconTip>
      )}
      {onAutoPing && (
        <IconTip label={t("Connection.Menu.AutoPing")}>
          <button
            aria-label={t("Connection.Menu.AutoPing")}
            aria-pressed={optimizer}
            className={styles.flag}
            data-active={optimizer || undefined}
            onClick={() => onAutoPing(connection)}
            type="button"
          >
            <Zap size={13} />
          </button>
        </IconTip>
      )}
    </div>
  );
}

/** The "three dots" menu with every action for one account. */
export function ConnectionMenu({
  connection,
  busy = false,
  onRefresh,
  onRename,
  onAlerts,
  onAutoPing,
  onEnabledChange,
  onRemove,
}: { connection: ProviderConnection; busy?: boolean } & ConnectionActions) {
  const { t } = useTranslation();
  const name = fullName(connection);
  return (
    <Menu.Root>
      <IconTip label={t("Connection.MoreActions")}>
        <Menu.Trigger
          render={
            <Button
              aria-label={t("Connection.ActionsFor", { name })}
              disabled={busy}
              size="sm"
              variant="icon-naked"
            />
          }
        >
          <Ellipsis size={15} />
        </Menu.Trigger>
      </IconTip>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={4}>
          <Menu.Popup className={styles.menu}>
            {onRename && (
              <Menu.Item onClick={() => onRename(connection)}>
                <Pencil size={14} />
                {t("Connection.Menu.Rename")}
              </Menu.Item>
            )}
            {onAlerts && (
              <Menu.Item onClick={() => onAlerts(connection)}>
                <BellRing size={14} />
                {t("Connection.Menu.Alerts")}
                <MenuState on={alertsOn(connection)} />
              </Menu.Item>
            )}
            {onAutoPing && (
              <Menu.Item onClick={() => onAutoPing(connection)}>
                <Zap size={14} />
                {t("Connection.Menu.AutoPing")}
                <MenuState on={connection.autoPing.enabled} />
              </Menu.Item>
            )}
            {onRefresh && (
              <Menu.Item onClick={() => onRefresh(connection.id)}>
                <RefreshCw size={14} />
                {t("Connection.Menu.Refresh")}
              </Menu.Item>
            )}
            {onEnabledChange && (
              <Menu.Item
                onClick={() =>
                  onEnabledChange(connection.id, !connection.enabled)
                }
              >
                <Power size={14} />
                {connection.enabled
                  ? t("Connection.Menu.Disable")
                  : t("Connection.Menu.Enable")}
              </Menu.Item>
            )}
            {onRemove && (
              <>
                <Menu.Separator />
                <Menu.Item
                  className={styles.dangerItem}
                  onClick={() => onRemove(connection.id)}
                >
                  <Trash2 size={14} />
                  {t("Connection.Menu.Remove")}
                </Menu.Item>
              </>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

/** One account on the Quota page. The menu bar popover uses `PopoverRow`. */
export default function ConnectionCard({
  connection,
  busy = false,
  ...actions
}: {
  connection: ProviderConnection;
  busy?: boolean;
} & ConnectionActions) {
  const { t } = useTranslation();
  const hasActions = Object.values(actions).some(Boolean);
  const plan = connection.identity?.plan;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <ProviderIcon provider={connection.provider} size={24} />
        <div className={styles.identity}>
          <h2>{PROVIDER_NAMES[connection.provider]}</h2>
          <p>
            {accountLabel(connection)}
            {plan && <span className={styles.plan}> · {plan}</span>}
          </p>
        </div>
        <StatusBadge connection={connection} />
        {busy && <RefreshCw className={styles.spinning} size={13} />}
        <FeatureFlags
          connection={connection}
          onAlerts={actions.onAlerts}
          onAutoPing={actions.onAutoPing}
        />
        {hasActions && (
          <ConnectionMenu busy={busy} connection={connection} {...actions} />
        )}
      </header>

      <div className={styles.body}>
        {connection.windows.length > 0 ? (
          <QuotaBars windows={connection.windows} />
        ) : (
          <p className={styles.empty}>
            {connection.lastError ?? t("Connection.NoQuotaData")}
          </p>
        )}
      </div>
    </article>
  );
}
