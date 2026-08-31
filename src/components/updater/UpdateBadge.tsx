"use client";

import { useTranslation } from "react-i18next";
import Badge from "@/components/Badge";
import IconTip from "../IconTip";
import { useAppUpdater } from "./AppUpdater";
import styles from "./UpdateBadge.module.scss";

/** Shows in the title bar once an update is downloaded. */
export default function UpdateBadge() {
  const { t } = useTranslation();
  const { status, info, installUpdate } = useAppUpdater();
  if (status !== "ready" && status !== "installing") return null;
  return (
    <IconTip label={t("Settings.Updates.RestartToApply")}>
      <button
        aria-label={
          info
            ? `${t("Settings.Updates.UpdateReady")} (${info.currentVersion} → ${info.version})`
            : undefined
        }
        className={styles.badgeButton}
        disabled={status === "installing"}
        onClick={() => void installUpdate()}
        type="button"
      >
        <Badge variant="success">{t("Settings.Updates.UpdateReady")}</Badge>
      </button>
    </IconTip>
  );
}
