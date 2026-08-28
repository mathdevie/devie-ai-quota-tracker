"use client";

import { Toast } from "@base-ui/react/toast";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardState, UpdateChannel } from "@/lib/contracts";
import Button from "@/ui/Button";
import Select from "@/ui/Select";
import Switch from "@/ui/Switch";
import LanguagePicker from "../LanguagePicker";
import SettingRow from "../SettingRow";
import ThemePicker from "../ThemePicker";
import pickerStyles from "../ThemePicker.module.scss";
import { useAppUpdater } from "../updater/AppUpdater";
import styles from "./views.module.scss";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

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
  onMenuBarItemChange,
  onUpdateChannelChange,
}: {
  state: DashboardState;
  busy?: boolean;
  onMenuBarItemChange: (visible: boolean) => void;
  onUpdateChannelChange: (channel: UpdateChannel) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.page} data-settings>
      <SettingRow.Group title={t("Settings.General")}>
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
