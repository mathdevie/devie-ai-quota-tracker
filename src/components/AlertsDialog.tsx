"use client";

import { useEffect, useState } from "react";
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
}: {
  connection?: ProviderConnection;
  onOpenChange: (open: boolean) => void;
  /** Resolves to true when the alerts were saved and the dialog can close. */
  onSubmit: (id: string, alerts: ConnectionAlerts) => Promise<boolean>;
}) {
  const [alerts, setAlerts] = useState<ConnectionAlerts>(NONE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (connection) setAlerts(connection.alerts);
  }, [connection]);

  const patch = (change: Partial<ConnectionAlerts>) =>
    setAlerts((current) => ({ ...current, ...change }));

  return (
    <Dialog.Root
      disableInteractions={saving}
      onOpenChange={onOpenChange}
      open={connection !== undefined}
      size="sm"
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
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
              <Dialog.Title>Alerts</Dialog.Title>
              {connection && (
                <Dialog.Description>{fullName(connection)}</Dialog.Description>
              )}
            </Dialog.Header>
            <Dialog.Body>
              <OptionRow.List>
                <OptionRow.Row
                  checked={alerts.lowQuota}
                  description="Alert me when a quota has 20% left."
                  label="Low quota"
                  onChange={(lowQuota) => patch({ lowQuota })}
                />
                <OptionRow.Row
                  checked={alerts.resetSoon}
                  description="Alert me 30 minutes before a quota resets."
                  label="Reset soon"
                  onChange={(resetSoon) => patch({ resetSoon })}
                />
                <OptionRow.Row
                  checked={alerts.resetHappened}
                  description="Alert me after a quota resets."
                  label="Reset complete"
                  onChange={(resetHappened) => patch({ resetHappened })}
                />
              </OptionRow.List>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button isLoading={saving} type="submit">
                Save
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
