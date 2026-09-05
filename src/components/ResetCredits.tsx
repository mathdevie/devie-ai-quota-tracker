"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProviderConnection, ResetCredit } from "@/lib/contracts";
import { formatDateTime } from "@/lib/date";
import { accountLabel } from "@/lib/labels";
import AlertDialog from "@/ui/AlertDialog";
import Button from "@/ui/Button";
import Popover from "@/ui/Popover";
import styles from "./ResetCredits.module.scss";

/** Banked Codex reset credits: a count, a list, and a confirmation. */
export default function ResetCredits({
  connections,
  compact = false,
  onUseReset,
  onOverlayChange,
}: {
  connections: ProviderConnection[];
  compact?: boolean;
  /** Resolves to true when the credit was spent. */
  onUseReset: (id: string, creditId: string) => Promise<boolean>;
  /** Reports when the list or the confirmation is open. */
  onOverlayChange?: (open: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<{
    connection: ProviderConnection;
    credit: ResetCredit;
  }>();
  const [busy, setBusy] = useState(false);
  const overlay = open || pending !== undefined;
  useEffect(() => {
    onOverlayChange?.(overlay);
    return () => onOverlayChange?.(false);
  }, [overlay, onOverlayChange]);
  const credits = connections.flatMap((connection) =>
    (connection.resetCredits ?? []).map((credit) => ({ connection, credit })),
  );
  if (credits.length === 0) return null;

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      if (await onUseReset(pending.connection.id, pending.credit.id)) {
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
          aria-label={t("Quota.ResetCredits.Available", {
            count: credits.length,
          })}
          title={t("Quota.ResetCredits.Available", { count: credits.length })}
        >
          <RotateCcw size={12} />
          {compact
            ? credits.length
            : t("Quota.ResetCredits.Available", { count: credits.length })}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            align={compact ? "end" : "start"}
            side="bottom"
            sideOffset={6}
          >
            <Popover.Popup className={styles.popup}>
              <Popover.Title className={styles.title}>
                {t("Quota.ResetCredits.Title")}
              </Popover.Title>
              <ul className={styles.list}>
                {credits.map(({ connection, credit }) => (
                  <li
                    className={styles.credit}
                    key={`${connection.id}:${credit.id}`}
                  >
                    <div className={styles.creditText}>
                      <span className={styles.creditTitle}>
                        {credit.title || t("Quota.ResetCredits.DefaultTitle")}
                      </span>
                      {compact && (
                        <span className={styles.creditExpiry}>
                          {accountLabel(connection)}
                        </span>
                      )}
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
                      onClick={() => setPending({ connection, credit })}
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
                  account: pending ? accountLabel(pending.connection) : "",
                  remaining:
                    (pending?.connection.resetCredits?.length ?? 1) - 1,
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
