"use client";

import { Toast } from "@base-ui/react/toast";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardState } from "@/lib/contracts";
import Button from "@/ui/Button";
import Switch from "@/ui/Switch";
import LanguagePicker from "../LanguagePicker";
import RemoteAccessSettings, {
  type RemoteAccessChange,
} from "../RemoteAccessSettings";
import SettingRow from "../SettingRow";
import ThemePicker from "../ThemePicker";
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
        <Button onClick={() => void installUpdate()} size="sm">
          {t("Settings.Updates.RestartToUpdate")}
        </Button>
      ) : (
        <Button
          disabled={
            !enabled ||
            status === "checking" ||
            status === "downloading" ||
            status === "installing"
          }
          onClick={() => void check()}
          size="sm"
          variant="secondary"
        >
          <RefreshCw size={14} />
          {t("Settings.Updates.CheckForUpdates")}
        </Button>
      )}
    </SettingRow.Row>
  );
}

export default function SettingsView({
  state,
  busy,
  onMenuBarItemChange,
  onRemoteAccessChange,
  onRegenerateRemoteToken,
}: {
  state: DashboardState;
  busy?: boolean;
  onMenuBarItemChange: (visible: boolean) => void;
  onRemoteAccessChange: (change: RemoteAccessChange) => void;
  onRegenerateRemoteToken: () => void;
}) {
  const { t } = useTranslation();
  // A remote browser keeps its own theme and language. The Mac owns the
  // menu bar, the server, and the updates.
  const remote = state.mode === "remote";
  return (
    <section className={styles.page}>
      <SettingRow.Group title={t("Settings.General")}>
        <SettingRow.Row title={t("Settings.Theme")}>
          <ThemePicker />
        </SettingRow.Row>
        <SettingRow.Row title={t("Settings.Language")}>
          <LanguagePicker />
        </SettingRow.Row>
        {!remote && (
          <>
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
            <UpdateRow />
          </>
        )}
      </SettingRow.Group>
      {!remote && (
        <SettingRow.Group
          description={t("Settings.Remote.Description")}
          title={t("Settings.Remote.Title")}
        >
          <RemoteAccessSettings
            access={state.settings.remoteAccess}
            busy={busy}
            onChange={onRemoteAccessChange}
            onRegenerateToken={onRegenerateRemoteToken}
          />
        </SettingRow.Group>
      )}
    </section>
  );
}
