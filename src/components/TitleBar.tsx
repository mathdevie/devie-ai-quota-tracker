import styles from "./TitleBar.module.scss";

export default function TitleBar({
  title,
  leading,
  children,
}: {
  title: string;
  leading?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.titleBar} data-tauri-drag-region>
      <div className={styles.leading}>
        {leading}
        <h1 className={styles.title}>{title}</h1>
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}
