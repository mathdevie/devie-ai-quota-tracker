import type { ReactNode } from "react";
import Separator from "@/ui/Separator";
import styles from "./SettingRow.module.scss";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function Row({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <p>{title}</p>
        {subtitle && <p className={styles.subText}>{subtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}

const SettingRow = { Section, Row, Separator };

export default SettingRow;
