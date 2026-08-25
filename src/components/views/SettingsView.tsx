"use client";

import ThemePicker from "../ThemePicker";
import styles from "./views.module.scss";

export default function SettingsView() {
  return (
    <section className={styles.page}>
      <div className={styles.group}>
        <h2 className={styles.groupTitle}>Theme</h2>
        <div className={styles.groupBody}>
          <ThemePicker />
        </div>
      </div>
    </section>
  );
}
