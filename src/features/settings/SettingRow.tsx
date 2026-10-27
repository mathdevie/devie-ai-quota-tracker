import type { ReactNode } from "react";
import styles from "./SettingRow.module.scss";

/** Rows separated by lines, no card around them. */
function List({ children }: { children: ReactNode }) {
  return <div className={styles.list}>{children}</div>;
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

/** A titled block of rows: a heading, an optional line under it, a frame. */
function Group({
  title,
  description,
  children,
  plain = false,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Skips the filled frame, for content that draws its own surfaces. */
  plain?: boolean;
}) {
  return (
    <section className={styles.group}>
      <header className={styles.groupHeader}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      <div className={plain ? undefined : styles.groupBody}>{children}</div>
    </section>
  );
}

const SettingRow = { List, Row, Group };

export default SettingRow;
