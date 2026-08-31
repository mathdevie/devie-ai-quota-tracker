import clsx from "clsx";
import { ChevronLeft, Settings, X } from "lucide-react";
import styles from "./TitleBar.module.scss";

export interface TitleBarAction {
  icon: "back" | "close" | "settings";
  label: string;
  onClick: () => void;
}

const ICONS = { back: ChevronLeft, close: X, settings: Settings };

function IconButton({ action }: { action: TitleBarAction }) {
  const Icon = ICONS[action.icon];
  return (
    <button
      aria-label={action.label}
      className={styles.iconButton}
      onClick={action.onClick}
      title={action.label}
      type="button"
    >
      <Icon aria-hidden size={16} strokeWidth={2} />
    </button>
  );
}

export default function TitleBar({
  title,
  leading,
  trailing,
  actions,
  windowControlsInset = false,
}: {
  title: string;
  /** Before the title: the back arrow of a provider page. */
  leading?: TitleBarAction;
  /** At the far right: the settings gear, or a cross inside Settings. */
  trailing?: TitleBarAction;
  /** Sits before the trailing button, for example an update button. */
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
      {leading && <IconButton action={leading} />}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.end}>
        {actions}
        {trailing && <IconButton action={trailing} />}
      </div>
    </header>
  );
}
