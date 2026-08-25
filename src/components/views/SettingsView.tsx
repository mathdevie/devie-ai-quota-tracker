"use client";

import { useTranslucency } from "@/lib/appearance";
import type { DashboardState } from "@/lib/contracts";
import { isDesktop } from "@/lib/desktop";
import Switch from "@/ui/Switch";
import ThemePicker from "../ThemePicker";
import styles from "./views.module.scss";

export default function SettingsView({ state }: { state: DashboardState }) {
  const [translucent, setTranslucent] = useTranslucency();
  const desktop = isDesktop();

  return (
    <section className={styles.page}>
      <div className={styles.group}>
        <h2 className={styles.groupTitle}>Theme</h2>
        <div className={styles.groupBody}>
          <ThemePicker />
        </div>
      </div>

      <div className={styles.group}>
        <h2 className={styles.groupTitle}>Window</h2>
        <div className={styles.list}>
          <div className={styles.row}>
            <div className={styles.rowMain}>
              <div>
                <h2>Translucent sidebar</h2>
                <p>Show the desktop through the sidebar, like Finder.</p>
              </div>
            </div>
            <div className={styles.rowActions}>
              <Switch.Root
                aria-label="Translucent sidebar"
                checked={translucent}
                disabled={!desktop}
                onCheckedChange={setTranslucent}
              >
                <Switch.Thumb />
              </Switch.Root>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.group}>
        <h2 className={styles.groupTitle}>Data</h2>
        <div className={styles.list}>
          <div className={styles.row}>
            <div className={styles.rowMain}>
              <div>
                <h2>Automatic refresh</h2>
                <p>Quotas refresh every five minutes.</p>
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.rowMain}>
              <div>
                <h2>Local database</h2>
                <p className={styles.mono}>{state.databasePath ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
