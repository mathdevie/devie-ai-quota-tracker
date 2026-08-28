"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProviderConnection, ResetCredit } from "@/lib/contracts";
import { formatDateTime } from "@/lib/date";
import { accountLabel } from "@/lib/labels";
import AlertDialog from "@/ui/AlertDialog";
import Button from "@/ui/Button";
import Popover from "@/ui/Popover";
import styles from "./ResetCredits.module.scss";

/**
 * The banked Codex reset credits of one account: a count under the quota
 * bars, the list in a popover, and a confirmation before one is spent.
 */
export default function ResetCredits({
  connection,
  onUseReset,
}: {
  connection: ProviderConnection;
  /** Resolves to true when the credit was spent. */
  onUseReset: (id: string, creditId: string) => Promise<boolean>;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ResetCredit>();
  const [busy, setBusy] = useState(false);
  const credits = connection.resetCredits ?? [];
  if (credits.length === 0) return null;

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      if (await onUseReset(connection.id, pending.id)) {
        setPending(undefined);
        setOpen(false);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Popover.Root onOpenChange={setOpen} open={open}>
        <Popover.Trigger
          render={<Button size="sm" variant="naked" />}
          className={styles.trigger}
        >
          <RotateCcw size={12} />
          {t("Quota.ResetCredits.Available", { count: credits.length })}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner align="start" side="bottom" sideOffset={6}>
            <Popover.Popup className={styles.popup}>
              <Popover.Title className={styles.title}>
                {t("Quota.ResetCredits.Title")}
              </Popover.Title>
              <Popover.Description className={styles.description}>
                {t("Quota.ResetCredits.Description")}
              </Popover.Description>
              <ul className={styles.list}>
                {credits.map((credit) => (
                  <li className={styles.credit} key={credit.id}>
                    <div className={styles.creditText}>
                      <span className={styles.creditTitle}>
                        {credit.title || t("Quota.ResetCredits.DefaultTitle")}
                      </span>
                      <span className={styles.creditExpiry}>
                        {credit.expiresAt
                          ? t("Quota.ResetCredits.Expires", {
                              date: formatDateTime(
                                credit.expiresAt,
                                i18n.language,
                              ),
                            })
                          : t("Quota.ResetCredits.NoExpiry")}
                      </span>
                    </div>
                    <Button
                      onClick={() => setPending(credit)}
                      size="sm"
                      variant="secondary"
                    >
                      {t("Quota.ResetCredits.Use")}
                    </Button>
                  </li>
                ))}
              </ul>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      <AlertDialog.Root
        disableInteractions={busy}
        onOpenChange={(next) => !next && !busy && setPending(undefined)}
        open={pending !== undefined}
        size="sm"
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Popup>
            <AlertDialog.Header>
              <AlertDialog.Title>
                {t("Quota.ResetCredits.ConfirmTitle")}
              </AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                {t("Quota.ResetCredits.ConfirmDescription", {
                  account: accountLabel(connection),
                  remaining: credits.length - 1,
                })}
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                disabled={busy}
                onClick={() => setPending(undefined)}
                size="sm"
                type="button"
                variant="secondary"
              >
                {t("Common.Cancel")}
              </Button>
              <Button
                disabled={busy}
                onClick={() => void confirm()}
                size="sm"
                type="button"
                variant="danger"
              >
                {t("Quota.ResetCredits.Confirm")}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
