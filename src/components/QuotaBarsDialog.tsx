"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProviderConnection } from "@/lib/contracts";
import { fullName } from "@/lib/labels";
import Button from "@/ui/Button";
import Dialog from "@/ui/Dialog";
import OptionRow from "./OptionRow";
import styles from "./OptionRow.module.scss";
import { untilText } from "./QuotaBars";

/** One switch per quota window: on shows the bar on the card, off hides it. */
export default function QuotaBarsDialog({
  connection,
  onOpenChange,
  onSubmit,
}: {
  /** The dialog is open while a connection is set. */
  connection?: ProviderConnection;
  onOpenChange: (open: boolean) => void;
  /** Resolves to true when the choice was saved and the dialog can close. */
  onSubmit: (id: string, hiddenKeys: string[]) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [hidden, setHidden] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (connection) setHidden(connection.hiddenWindows ?? []);
  }, [connection]);

  const setShown = (key: string, shown: boolean) =>
    setHidden((current) =>
      shown ? current.filter((item) => item !== key) : [...current, key],
    );

  /** "37% left · resets in 4h 13m", or "Unlimited" for an uncapped window. */
  const describe = (window: ProviderConnection["windows"][number]) => {
    if (window.unlimited) return t("Quota.Unlimited");
    const left = Math.max(0, Math.round(100 - window.usedPercent));
    const reset = untilText(t, window.resetsAt);
    const parts = [t("Bars.Left", { percent: left })];
    if (reset) parts.push(t("Bars.Resets", { time: reset }));
    return parts.join(" · ");
  };

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
                // Keep only keys the account still reports.
                const keys = connection.windows.map((window) => window.key);
                const kept = hidden.filter((key) => keys.includes(key));
                if (await onSubmit(connection.id, kept)) onOpenChange(false);
              } finally {
                setSaving(false);
              }
            }}
          >
            <Dialog.Header>
              <Dialog.Title>{t("Bars.Title")}</Dialog.Title>
              {connection && (
                <Dialog.Description>{fullName(connection)}</Dialog.Description>
              )}
            </Dialog.Header>
            <Dialog.Body>
              <div className={styles.group}>
                <OptionRow.List>
                  {connection?.windows.map((window) => {
                    const shown = !hidden.includes(window.key);
                    return (
                      <OptionRow.Row
                        checked={shown}
                        description={describe(window)}
                        key={window.key}
                        label={window.label}
                        onChange={(next) => setShown(window.key, next)}
                        state={shown ? t("Bars.Shown") : t("Bars.Hidden")}
                      />
                    );
                  })}
                </OptionRow.List>
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="secondary"
              >
                {t("Common.Cancel")}
              </Button>
              <Button isLoading={saving} type="submit">
                {t("Common.Save")}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
