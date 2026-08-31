import clsx from "clsx";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import styles from "./TitleBar.module.scss";

export default function TitleBar({
  title,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onOpenSettings,
  backLabel,
  forwardLabel,
  settingsLabel,
  actions,
  windowControlsInset = false,
}: {
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onOpenSettings: () => void;
  backLabel: string;
  forwardLabel: string;
  settingsLabel: string;
  /** Sits before the settings button, for example an update button. */
  actions?: React.ReactNode;
  /** Clears the native macOS traffic lights, which overlay the window. */
  windowControlsInset?: boolean;
}) {
  return (
    <header
      className={clsx(
        styles.titleBar,
        windowControlsInset && styles.windowControlsInset,
      )}
      data-tauri-drag-region
    >
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
      <div className={styles.end}>
        {actions}
        <button
          aria-label={settingsLabel}
          className={styles.settingsButton}
          onClick={onOpenSettings}
          title={settingsLabel}
          type="button"
        >
          <Settings aria-hidden size={16} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
