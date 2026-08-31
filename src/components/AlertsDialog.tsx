"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ConnectionAlerts, ProviderConnection } from "@/lib/contracts";
import { fullName } from "@/lib/labels";
import Button from "@/ui/Button";
import Dialog from "@/ui/Dialog";
import OptionRow from "./OptionRow";
import styles from "./OptionRow.module.scss";

const NONE: ConnectionAlerts = {
  lowQuota: false,
  resetSoon: false,
  resetHappened: false,
};

export default function AlertsDialog({
  connection,
  onOpenChange,
  onSubmit,
  onTest,
}: {
  connection?: ProviderConnection;
  onOpenChange: (open: boolean) => void;
  /** Resolves to true when the alerts were saved and the dialog can close. */
  onSubmit: (id: string, alerts: ConnectionAlerts) => Promise<boolean>;
  /** Sends a sample notification; resolves to true when it was shown. */
  onTest: (id: string) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<ConnectionAlerts>(NONE);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (connection) setAlerts(connection.alerts);
  }, [connection]);

  const patch = (change: Partial<ConnectionAlerts>) =>
    setAlerts((current) => ({ ...current, ...change }));

  return (
    <Dialog.Root
      disableInteractions={saving || testing}
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
                if (await onSubmit(connection.id, alerts)) onOpenChange(false);
              } finally {
                setSaving(false);
              }
            }}
          >
            <Dialog.Header>
              <Dialog.Title>{t("Alerts.Title")}</Dialog.Title>
              {connection && (
                <Dialog.Description>{fullName(connection)}</Dialog.Description>
              )}
            </Dialog.Header>
            <Dialog.Body>
              <OptionRow.List>
                <OptionRow.Row
                  checked={alerts.lowQuota}
                  description={t("Alerts.LowQuotaDescription")}
                  label={t("Alerts.LowQuota")}
                  onChange={(lowQuota) => patch({ lowQuota })}
                />
                <OptionRow.Row
                  checked={alerts.resetSoon}
                  description={t("Alerts.ResetSoonDescription")}
                  label={t("Alerts.ResetSoon")}
                  onChange={(resetSoon) => patch({ resetSoon })}
                />
                <OptionRow.Row
                  checked={alerts.resetHappened}
                  description={t("Alerts.ResetCompleteDescription")}
                  label={t("Alerts.ResetComplete")}
                  onChange={(resetHappened) => patch({ resetHappened })}
                />
              </OptionRow.List>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                disabled={saving}
                isLoading={testing}
                onClick={async () => {
                  if (!connection) return;
                  setTesting(true);
                  try {
                    await onTest(connection.id);
                  } finally {
                    setTesting(false);
                  }
                }}
                size="sm"
                type="button"
                variant="secondary"
              >
                {t("Alerts.SendTest")}
              </Button>
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
