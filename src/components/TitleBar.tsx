import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./TitleBar.module.scss";

export default function TitleBar({
  title,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  backLabel,
  forwardLabel,
}: {
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  backLabel: string;
  forwardLabel: string;
}) {
  return (
    <header className={styles.titleBar} data-tauri-drag-region>
      <div className={styles.navigation}>
        <button
          aria-label={backLabel}
          className={styles.navigationButton}
          disabled={!canGoBack}
          onClick={onBack}
          title={backLabel}
          type="button"
        >
          <ChevronLeft aria-hidden size={16} strokeWidth={2} />
        </button>
        <button
          aria-label={forwardLabel}
          className={styles.navigationButton}
          disabled={!canGoForward}
          onClick={onForward}
          title={forwardLabel}
          type="button"
        >
          <ChevronRight aria-hidden size={16} strokeWidth={2} />
        </button>
      </div>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
