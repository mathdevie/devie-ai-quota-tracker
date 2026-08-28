"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProviderConnection } from "@/lib/contracts";
import Button from "@/ui/Button";
import Dialog from "@/ui/Dialog";
import OptionRow from "./OptionRow";
import styles from "./OptionRow.module.scss";

/** The Quota Optimizer sends small session-start requests to Claude and Codex only. */
export function autoPingSupported(connection: ProviderConnection): boolean {
  return connection.provider === "claude" || connection.provider === "codex";
}

export default function AutoPingDialog({
  connection,
  onOpenChange,
  onSubmit,
}: {
  connection?: ProviderConnection;
  onOpenChange: (open: boolean) => void;
  /** Resolves to true when the setting was saved and the dialog can close. */
  onSubmit: (id: string, enabled: boolean) => Promise<boolean>;
}) {
  const { t, i18n } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (connection) setEnabled(connection.autoPing.enabled);
  }, [connection]);

  const supported = connection ? autoPingSupported(connection) : false;

  return (
    <Dialog.Root
      disableInteractions={saving}
      onOpenChange={onOpenChange}
      open={connection !== undefined}
      size="sm"
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup className={styles.dialog}>
          <form
            className={styles.form}
            onSubmit={async (event) => {
              event.preventDefault();
              if (!connection) return;
              setSaving(true);
              try {
                if (await onSubmit(connection.id, enabled)) onOpenChange(false);
              } finally {
                setSaving(false);
              }
            }}
          >
            <Dialog.Header>
              <Dialog.Title>{t("AutoPing.Title")}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <div className={styles.group}>
                <OptionRow.Row
                  checked={supported && enabled}
                  description={
                    supported
                      ? t("AutoPing.SupportedDescription")
                      : t("AutoPing.UnsupportedDescription")
                  }
                  disabled={!supported}
                  label={t("AutoPing.StartNextSession")}
                  onChange={setEnabled}
                  plain
                />
                {connection?.autoPing.lastError && (
                  <OptionRow.Note tone="danger">
                    {connection.autoPing.lastError}
                  </OptionRow.Note>
                )}
                {connection?.autoPing.lastPingAt && (
                  <OptionRow.Note>
                    {t("AutoPing.LastRequest", {
                      date: new Date(
                        connection.autoPing.lastPingAt,
                      ).toLocaleString(i18n.language),
                    })}
                  </OptionRow.Note>
                )}
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={() => onOpenChange(false)}
                size="sm"
                type="button"
                variant="secondary"
              >
                {t("Common.Cancel")}
              </Button>
              <Button isLoading={saving} size="sm" type="submit">
                {t("Common.Save")}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
