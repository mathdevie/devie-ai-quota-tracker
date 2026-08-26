import type { TFunction } from "i18next";
import { Pin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { QuotaWindow } from "@/lib/contracts";
import { formatDateTime } from "@/lib/date";
import Tooltip from "@/ui/Tooltip";
import IconTip from "./IconTip";
import styles from "./QuotaBars.module.scss";

/** The reset countdown; the full date shows on hover. */
function ResetTime({ value }: { value?: string }) {
  const { t, i18n } = useTranslation();
  const text = untilText(t, value);
  if (!value || !text) return <span className={styles.reset}>—</span>;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<span className={styles.reset} />}>
        {text}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={6}>
          <Tooltip.Popup>
            {t("Quota.Reset.On", {
              date: formatDateTime(value, i18n.language),
            })}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/** "in 4h 13m", "in 6d 4h", or "now" for a past reset. */
export function untilText(t: TFunction, value?: string): string | undefined {
  if (!value) return undefined;
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);
  if (minutes <= 0) return t("Quota.Reset.Now");
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  if (days > 0) return t("Quota.Reset.InDaysHours", { days, hours });
  if (hours > 0)
    return t("Quota.Reset.InHoursMinutes", { hours, minutes: rest });
  return t("Quota.Reset.InMinutes", { minutes: rest });
}

export type QuotaLevel = "ok" | "warning" | "danger";

/** Bars turn orange under 50% left and red under 25% left. */
export function quotaLevel(leftPercent: number): QuotaLevel {
  if (leftPercent < 25) return "danger";
  if (leftPercent < 50) return "warning";
  return "ok";
}

/**
 * One line per quota window: label, bar, percent left, reset time. The bar
 * gives way first; the reset time is never cut.
 */
export default function QuotaBars({
  windows,
  size = "md",
  pinnedKey,
  onPin,
}: {
  windows: QuotaWindow[];
  size?: "md" | "sm";
  /** The window the menu bar shows. Set `onPin` to let the user change it. */
  pinnedKey?: string;
  onPin?: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.bars} data-size={size}>
      {windows.map((window) => {
        const left = Math.max(0, Math.round(100 - window.usedPercent));
        const pinned = window.key === pinnedKey;
        return (
          <div
            className={styles.window}
            data-level={quotaLevel(left)}
            key={window.key}
          >
            <span className={styles.dot} />
            <span className={styles.label} title={window.label}>
              {window.label}
            </span>
            <span className={styles.track}>
              <span
                className={styles.fill}
                style={{ width: `${Math.min(100, left)}%` }}
              />
            </span>
            <span className={styles.percent}>{left}%</span>
            <ResetTime value={window.resetsAt} />
            {onPin && (
              <IconTip label={t("Quota.Pin.Title")}>
                <button
                  aria-label={
                    pinned
                      ? t("Quota.Pin.Shown", { label: window.label })
                      : t("Quota.Pin.Show", { label: window.label })
                  }
                  aria-pressed={pinned}
                  className={styles.pin}
                  onClick={() => onPin(window.key)}
                  type="button"
                >
                  <Pin fill={pinned ? "currentColor" : "none"} size={12} />
                </button>
              </IconTip>
            )}
          </div>
        );
      })}
    </div>
  );
}
