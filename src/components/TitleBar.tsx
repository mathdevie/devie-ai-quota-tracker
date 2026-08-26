import styles from "./TitleBar.module.scss";

export default function TitleBar({
  title,
  leading,
}: {
  title: string;
  /** Navigation only, for example a back button. Actions live in the content. */
  leading?: React.ReactNode;
}) {
  return (
    <header className={styles.titleBar} data-tauri-drag-region>
      <div className={styles.leading}>
        {leading}
        <h1 className={styles.title}>{title}</h1>
      </div>
    </header>
  );
}
