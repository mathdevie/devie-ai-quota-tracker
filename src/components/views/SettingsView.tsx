"use client";

import { RefreshCw } from "lucide-react";
import type { DashboardState } from "@/lib/contracts";
import Button from "@/ui/Button";
import Switch from "@/ui/Switch";
import SettingRow from "../SettingRow";
import ThemePicker from "../ThemePicker";
import { useAppUpdater } from "../updater/AppUpdater";
import styles from "./views.module.scss";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

function UpdateRow() {
  const {
    enabled,
    status,
    progress,
    info,
    error,
    checkForUpdates,
    installUpdate,
  } = useAppUpdater();

  const subtitle = (() => {
    if (!enabled) return "Updates work in the packaged app only.";
    if (status === "checking") return "Checking…";
    if (status === "downloading") return `Downloading ${progress}%`;
    if (status === "ready") return `Version ${info?.version} is ready.`;
    if (status === "installing") return "Installing…";
    if (status === "error") return error ?? "The update failed.";
    return `Devie Quota ${APP_VERSION} is up to date.`;
  })();

  return (
    <SettingRow.Row subtitle={subtitle} title="Updates">
      {status === "ready" ? (
        <Button onClick={() => void installUpdate()} size="sm">
          Restart to update
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
          Check for updates
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
  return (
    <section className={styles.page}>
      <SettingRow.Section title="Appearance">
        <SettingRow.Row title="Theme">
          <ThemePicker />
        </SettingRow.Row>
      </SettingRow.Section>

      <SettingRow.Section title="Menu bar">
        <SettingRow.Row
          subtitle="Shows the lowest remaining quota next to the clock."
          title="Show the menu bar item"
        >
          <Switch.Root
            aria-label="Show the menu bar item"
            checked={state.settings.showMenuBarItem}
            disabled={busy}
            onCheckedChange={(checked) => onMenuBarItemChange(checked)}
          >
            <Switch.Thumb />
          </Switch.Root>
        </SettingRow.Row>
      </SettingRow.Section>

      <SettingRow.Section title="About">
        <UpdateRow />
        <SettingRow.Separator />
        <SettingRow.Row
          subtitle={
            <span className={styles.mono}>{state.databasePath ?? "—"}</span>
          }
          title="Database"
        />
      </SettingRow.Section>
    </section>
  );
}
