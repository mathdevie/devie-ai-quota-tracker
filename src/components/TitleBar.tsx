import clsx from "clsx";
import { ChevronLeft, Settings, X } from "lucide-react";
import styles from "./TitleBar.module.scss";

/** The leading action: a cross closes Settings, an arrow goes up a level. */
export interface TitleBarLeading {
  icon: "close" | "back";
  label: string;
  onClick: () => void;
}

export default function TitleBar({
  title,
  leading,
  onOpenSettings,
  settingsLabel,
  actions,
  windowControlsInset = false,
}: {
  title: string;
  leading?: TitleBarLeading;
  /** The gear button; leave undefined inside Settings to hide it. */
  onOpenSettings?: () => void;
  settingsLabel: string;
  /** Sits before the settings button, for example an update button. */
  actions?: React.ReactNode;
  /** Clears the native macOS traffic lights, which overlay the window. */
  windowControlsInset?: boolean;
}) {
  const LeadingIcon = leading?.icon === "close" ? X : ChevronLeft;
  return (
    <header
      className={clsx(
        styles.titleBar,
        windowControlsInset && styles.windowControlsInset,
      )}
      data-tauri-drag-region
    >
      {leading && (
        <button
          aria-label={leading.label}
          className={styles.iconButton}
          onClick={leading.onClick}
          title={leading.label}
          type="button"
        >
          <LeadingIcon aria-hidden size={16} strokeWidth={2} />
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.end}>
        {actions}
        {onOpenSettings && (
          <button
            aria-label={settingsLabel}
            className={styles.iconButton}
            onClick={onOpenSettings}
            title={settingsLabel}
            type="button"
          >
            <Settings aria-hidden size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}
