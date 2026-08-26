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

const SettingRow = { List, Row };

export default SettingRow;
