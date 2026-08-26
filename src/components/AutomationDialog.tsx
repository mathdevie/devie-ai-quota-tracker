"use client";

import { useEffect, useState } from "react";
import type { ConnectionAlerts, ProviderConnection } from "@/lib/contracts";
import { accountLabel, PROVIDER_NAMES } from "@/lib/labels";
import Button from "@/ui/Button";
import Dialog from "@/ui/Dialog";
import Switch from "@/ui/Switch";
import styles from "./AutomationDialog.module.scss";

interface OptionProps {
  checked: boolean;
  disabled?: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}

function Option({
  checked,
  disabled,
  description,
  label,
  onChange,
}: OptionProps) {
  return (
    <div className={styles.option} data-disabled={disabled || undefined}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <Switch.Root
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      >
        <Switch.Thumb />
      </Switch.Root>
    </div>
  );
}

export default function AutomationDialog({
  connection,
  onOpenChange,
  onSubmit,
}: {
  connection?: ProviderConnection;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    id: string,
    alerts: ConnectionAlerts,
    autoPingEnabled: boolean,
  ) => Promise<boolean>;
}) {
  const [alerts, setAlerts] = useState<ConnectionAlerts>({
    lowQuota: false,
    resetSoon: false,
    resetHappened: false,
  });
  const [autoPingEnabled, setAutoPingEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!connection) return;
    setAlerts(connection.alerts);
    setAutoPingEnabled(connection.autoPing.enabled);
  }, [connection]);

  const autoPingSupported =
    connection?.kind === "oauth" && connection.provider !== "copilot";
  const autoPingDescription = autoPingSupported
    ? "Send one small request after a session resets."
    : "Auto-ping needs a Claude or Codex app sign-in.";

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
                const saved = await onSubmit(
                  connection.id,
                  alerts,
                  autoPingEnabled,
                );
                if (saved) onOpenChange(false);
              } finally {
                setSaving(false);
              }
            }}
          >
            <Dialog.Header>
              <Dialog.Title>Alerts and auto-ping</Dialog.Title>
              {connection && (
                <Dialog.Description>
                  {PROVIDER_NAMES[connection.provider]} ·{" "}
                  {accountLabel(connection)}
                </Dialog.Description>
              )}
            </Dialog.Header>
            <Dialog.Body>
              <div className={styles.group}>
                <h3>Alerts</h3>
                <div className={styles.options}>
                  <Option
                    checked={alerts.lowQuota}
                    description="Alert me when a quota has 20% left."
                    label="Low quota"
                    onChange={(lowQuota) =>
                      setAlerts((current) => ({ ...current, lowQuota }))
                    }
                  />
                  <Option
                    checked={alerts.resetSoon}
                    description="Alert me 30 minutes before a quota resets."
                    label="Reset soon"
                    onChange={(resetSoon) =>
                      setAlerts((current) => ({ ...current, resetSoon }))
                    }
                  />
                  <Option
                    checked={alerts.resetHappened}
                    description="Alert me after a quota resets."
                    label="Reset complete"
                    onChange={(resetHappened) =>
                      setAlerts((current) => ({ ...current, resetHappened }))
                    }
                  />
                </div>
              </div>
              <div className={styles.group}>
                <h3>Automatic request</h3>
                <div className={styles.options}>
                  <Option
                    checked={autoPingEnabled}
                    description={autoPingDescription}
                    disabled={!autoPingSupported}
                    label="Start the next session"
                    onChange={setAutoPingEnabled}
                  />
                </div>
                {connection?.autoPing.lastError && (
                  <p className={styles.error}>
                    {connection.autoPing.lastError}
                  </p>
                )}
                {connection?.autoPing.lastPingAt && (
                  <p className={styles.status}>
                    Last request:{" "}
                    {new Date(connection.autoPing.lastPingAt).toLocaleString()}
                  </p>
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
