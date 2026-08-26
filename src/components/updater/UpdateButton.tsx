"use client";

import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "@/ui/Button";
import { useAppUpdater } from "./AppUpdater";
import styles from "./UpdateButton.module.scss";

/** Shows in the sidebar once an update is downloaded. */
export default function UpdateButton() {
  const { t } = useTranslation();
  const { status, info, installUpdate } = useAppUpdater();
  if (status !== "ready" && status !== "installing") return null;
  return (
    <Button
      className={styles.button}
      isLoading={status === "installing"}
      onClick={() => void installUpdate()}
      size="sm"
      title={info ? `${info.currentVersion} → ${info.version}` : undefined}
    >
      <Download size={14} />
      {t("Settings.Updates.UpdateAvailable")}
    </Button>
  );
}
