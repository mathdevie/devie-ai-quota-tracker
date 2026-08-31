"use client";

import { Toast } from "@base-ui/react/toast";
import { ArrowLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "@/components/Badge";
import type { DashboardState, Provider, UpdateChannel } from "@/lib/contracts";
import { getLaunchAtLogin, setLaunchAtLogin } from "@/lib/desktop";
import { PROVIDER_NAMES, PROVIDERS } from "@/lib/labels";
import Button from "@/ui/Button";
import Select from "@/ui/Select";
import Switch from "@/ui/Switch";
import LanguagePicker from "../LanguagePicker";
import ProviderIcon from "../ProviderIcon";
import SettingRow from "../SettingRow";
import ThemePicker from "../ThemePicker";
import pickerStyles from "../ThemePicker.module.scss";
import { useAppUpdater } from "../updater/AppUpdater";
import styles from "./views.module.scss";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

function ProviderCard({
  provider,
  state,
  onOpen,
}: {
  provider: Provider;
  state: DashboardState;
  onOpen: (provider: Provider) => void;
}) {
  const { t } = useTranslation();
  const connections = state.connections.filter(
    (connection) => connection.provider === provider,
  );
  const connected = connections.filter(
    (connection) => connection.enabled && connection.status !== "error",
  ).length;
  const attention = connections.filter(
    (connection) =>
      connection.enabled &&
      (connection.status === "needs_login" || connection.status === "error"),
  ).length;
  return (
    <button
      className={styles.providerCard}
      onClick={() => onOpen(provider)}
      type="button"
    >
      <span className={styles.providerCardHeader}>
        <ProviderIcon provider={provider} size={28} />
        <span className={styles.providerCardTitle}>
          <strong>{PROVIDER_NAMES[provider]}</strong>
        </span>
        <ChevronRight className={styles.chevron} size={16} />
      </span>
      {(connected > 0 || attention > 0) && (
        <span className={styles.providerBadges}>
          {connected > 0 && (
            <Badge variant="success">
              {t("Providers.Connected", { total: connected })}
            </Badge>
          )}
          {attention > 0 && (
            <Badge variant="warning">
              {t("Providers.Attention", { total: attention })}
            </Badge>
          )}
        </span>
      )}
    </button>
  );
}

function ProvidersGroup({
  state,
  onOpen,
}: {
  state: DashboardState;
  onOpen: (provider: Provider) => void;
}) {
  const { t } = useTranslation();
  const active = PROVIDERS.filter((provider) =>
    state.connections.some((connection) => connection.provider === provider),
  );
  const ordered = [
    ...active,
    ...PROVIDERS.filter((provider) => !active.includes(provider)),
  ];
  return (
    <SettingRow.Group plain title={t("Nav.Providers")}>
      <div className={styles.providerGrid}>
        {ordered.map((provider) => (
          <ProviderCard
            key={provider}
            onOpen={onOpen}
            provider={provider}
            state={state}
          />
        ))}
      </div>
    </SettingRow.Group>
  );
}

function UpdateRow() {
  const { t } = useTranslation();
  const toasts = Toast.useToastManager();
  const {
    enabled,
    status,
    progress,
    info,
    error,
    checkForUpdates,
    installUpdate,
  } = useAppUpdater();

  // A check is quick: the row does not change while it runs. A toast tells
  // the result when there is nothing to install.
  async function check() {
    const result = await checkForUpdates();
    if (result === "up-to-date") {
      toasts.add({
        type: "success",
        description: t("Settings.Updates.UpToDateToast"),
      });
    }
  }

  const statusText = (() => {
    if (!enabled) return t("Settings.Updates.Status.PackagedOnly");
    if (status === "downloading") {
      return t("Settings.Updates.Status.Downloading", { progress });
    }
    if (status === "ready") {
      return t("Settings.Updates.Status.Ready", { version: info?.version });
    }
    if (status === "installing") {
      return t("Settings.Updates.Status.Installing");
    }
    if (status === "error") {
      return error ?? t("Settings.Updates.Status.Failed");
    }
    return t("Settings.Updates.Version", { version: APP_VERSION });
  })();

  return (
    <SettingRow.Row
      subtitle={
        <span className={status === "error" ? styles.dangerText : undefined}>
          {statusText}
        </span>
      }
      title={t("Settings.Updates.Title")}
    >
      {status === "ready" ? (
        <Button
          className={styles.updateAction}
          onClick={() => void installUpdate()}
          size="md"
        >
          {t("Settings.Updates.RestartToUpdate")}
        </Button>
      ) : (
        <Button
          className={styles.updateAction}
          disabled={
            !enabled ||
            status === "checking" ||
            status === "downloading" ||
            status === "installing"
          }
          onClick={() => void check()}
          size="md"
          variant="secondary"
        >
          <RefreshCw size={14} />
          {t("Settings.Updates.CheckForUpdates")}
        </Button>
      )}
    </SettingRow.Row>
  );
}

// The OS keeps the login item state, so the row loads and saves it itself
// instead of going through the dashboard state.
function LaunchAtLoginRow() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLaunchAtLogin()
      .catch(() => false)
      .then((value) => {
        if (!cancelled) setEnabled(value);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The switch flips right away; a failure puts back the real OS state.
  async function change(checked: boolean) {
    setEnabled(checked);
    try {
      setEnabled(await setLaunchAtLogin(checked));
    } catch {
      setEnabled(await getLaunchAtLogin().catch(() => !checked));
    }
  }

  return (
    <SettingRow.Row
      subtitle={t("Settings.LaunchAtLoginDescription")}
      title={t("Settings.LaunchAtLogin")}
    >
      <Switch.Root
        aria-label={t("Settings.EnableLaunchAtLogin")}
        checked={enabled ?? false}
        disabled={enabled === null}
        onCheckedChange={(checked) => void change(checked)}
      >
        <Switch.Thumb />
      </Switch.Root>
    </SettingRow.Row>
  );
}

const CHANNELS: UpdateChannel[] = ["stable", "nightly"];

function ChannelRow({
  channel,
  busy,
  onChange,
}: {
  channel: UpdateChannel;
  busy?: boolean;
  onChange: (channel: UpdateChannel) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const { enabled, recheck } = useAppUpdater();
  const labels: Record<UpdateChannel, string> = {
    stable: t("Settings.Updates.Channels.Stable"),
    nightly: t("Settings.Updates.Channels.Nightly"),
  };

  // A new channel has its own latest version: check it right away.
  async function change(next: UpdateChannel) {
    if (next === channel) return;
    if (await onChange(next)) void recheck();
  }

  return (
    <SettingRow.Row
      subtitle={t("Settings.Updates.ChannelDescription")}
      title={t("Settings.Updates.Channel")}
    >
      <Select.Root
        disabled={busy || !enabled}
        onValueChange={(value: UpdateChannel | null) =>
          value && void change(value)
        }
        value={channel}
      >
        <Select.Trigger
          aria-label={t("Settings.Updates.Channel")}
          className={pickerStyles.trigger}
        >
          <Select.Value>{labels[channel]}</Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
            <Select.Popup className={pickerStyles.popup}>
              <Select.List>
                {CHANNELS.map((option) => (
                  <Select.Item key={option} value={option}>
                    <Select.ItemText>{labels[option]}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </SettingRow.Row>
  );
}

export default function SettingsView({
  state,
  busy,
  onClose,
  onMenuBarItemChange,
  onOpenProvider,
  onUpdateChannelChange,
  onTelemetryChange,
}: {
  state: DashboardState;
  busy?: boolean;
  onClose: () => void;
  onMenuBarItemChange: (visible: boolean) => void;
  onOpenProvider: (provider: Provider) => void;
  onUpdateChannelChange: (channel: UpdateChannel) => Promise<boolean>;
  onTelemetryChange: (enabled: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.page} data-settings>
      <Button
        className={styles.pageBack}
        onClick={onClose}
        size="sm"
        variant="naked"
      >
        <ArrowLeft size={14} />
        {t("Settings.BackToDashboard")}
      </Button>
      <ProvidersGroup onOpen={onOpenProvider} state={state} />
      <SettingRow.Group title={t("Settings.General")}>
        <LaunchAtLoginRow />
        <SettingRow.Row
          subtitle={t("Settings.MenuBarItemDescription")}
          title={t("Settings.MenuBarItem")}
        >
          <Switch.Root
            aria-label={t("Settings.ShowMenuBarItem")}
            checked={state.settings.showMenuBarItem}
            disabled={busy}
            onCheckedChange={(checked) => onMenuBarItemChange(checked)}
          >
            <Switch.Thumb />
          </Switch.Root>
        </SettingRow.Row>
      </SettingRow.Group>
      <SettingRow.Group title={t("Settings.Appearance")}>
        <SettingRow.Row title={t("Settings.Theme")}>
          <ThemePicker />
        </SettingRow.Row>
        <SettingRow.Row title={t("Settings.Language")}>
          <LanguagePicker />
        </SettingRow.Row>
      </SettingRow.Group>
      <SettingRow.Group title={t("Settings.Privacy")}>
        <SettingRow.Row
          subtitle={t("Settings.TelemetryDescription")}
          title={t("Settings.Telemetry")}
        >
          <Switch.Root
            aria-label={t("Settings.EnableTelemetry")}
            checked={state.settings.telemetryEnabled}
            disabled={busy}
            onCheckedChange={(checked) => onTelemetryChange(checked)}
          >
            <Switch.Thumb />
          </Switch.Root>
        </SettingRow.Row>
      </SettingRow.Group>
      <SettingRow.Group title={t("Settings.About")}>
        <UpdateRow />
        <ChannelRow
          busy={busy}
          channel={state.settings.updateChannel}
          onChange={onUpdateChannelChange}
        />
      </SettingRow.Group>
    </section>
  );
}
