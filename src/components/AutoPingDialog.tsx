"use client";

import { useEffect, useState } from "react";
import type { ProviderConnection } from "@/lib/contracts";
import { fullName } from "@/lib/labels";
import Button from "@/ui/Button";
import Dialog from "@/ui/Dialog";
import OptionRow from "./OptionRow";
import styles from "./OptionRow.module.scss";

/** Auto-ping only has small session-start requests for Claude and Codex. */
export function autoPingSupported(connection: ProviderConnection): boolean {
  return (
    connection.kind === "oauth" &&
    (connection.provider === "claude" || connection.provider === "codex")
  );
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
        <Dialog.Popup>
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
              <Dialog.Title>Auto-ping</Dialog.Title>
              {connection && (
                <Dialog.Description>{fullName(connection)}</Dialog.Description>
              )}
            </Dialog.Header>
            <Dialog.Body>
              <div className={styles.group}>
                <OptionRow.List>
                  <OptionRow.Row
                    checked={supported && enabled}
                    description={
                      supported
                        ? "Send one small request after a session resets."
                        : "Auto-ping needs a Claude or Codex sign-in made in this app. Other accounts cannot use it."
                    }
                    disabled={!supported}
                    label="Start the next session"
                    onChange={setEnabled}
                  />
                </OptionRow.List>
                {connection?.autoPing.lastError && (
                  <OptionRow.Note tone="danger">
                    {connection.autoPing.lastError}
                  </OptionRow.Note>
                )}
                {connection?.autoPing.lastPingAt && (
                  <OptionRow.Note>
                    Last request:{" "}
                    {new Date(connection.autoPing.lastPingAt).toLocaleString()}
                  </OptionRow.Note>
                )}
              </div>
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
