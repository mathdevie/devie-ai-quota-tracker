"use client";

import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardState } from "@/lib/contracts";
import Button from "@/ui/Button";
import Switch from "@/ui/Switch";
import LanguagePicker from "../LanguagePicker";
import SettingRow from "../SettingRow";
import ThemePicker from "../ThemePicker";
import { useAppUpdater } from "../updater/AppUpdater";
import styles from "./views.module.scss";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

function UpdateRow() {
  const { t } = useTranslation();
  const {
    enabled,
    status,
    progress,
    info,
    error,
    checkForUpdates,
    installUpdate,
  } = useAppUpdater();

  const statusText = (() => {
    if (!enabled) return t("Settings.Updates.Status.PackagedOnly");
    if (status === "checking") return t("Settings.Updates.Status.Checking");
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
    return t("Settings.Updates.Status.UpToDate", { version: APP_VERSION });
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
          onClick={() => void checkForUpdates()}
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
}: {
  state: DashboardState;
  busy?: boolean;
  onMenuBarItemChange: (visible: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.page}>
      <SettingRow.List>
        <SettingRow.Row
          subtitle={t("Settings.ThemeDescription")}
          title={t("Settings.Theme")}
        >
          <ThemePicker />
        </SettingRow.Row>
        <SettingRow.Row
          subtitle={t("Settings.LanguageDescription")}
          title={t("Settings.Language")}
        >
          <LanguagePicker />
        </SettingRow.Row>
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
      </SettingRow.List>
    </section>
  );
}
