"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProviderConnection } from "@/lib/contracts";
import { accountLabel, PROVIDER_NAMES } from "@/lib/labels";
import Button from "@/ui/Button";
import Dialog from "@/ui/Dialog";
import Field from "@/ui/Field";
import styles from "./RenameDialog.module.scss";

export default function RenameDialog({
  connection,
  onOpenChange,
  onSubmit,
}: {
  /** The dialog is open while a connection is set. */
  connection?: ProviderConnection;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, label: string) => void;
}) {
  const { t } = useTranslation();
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(connection?.customLabel ?? "");
  }, [connection]);

  const fallback = connection
    ? connection.identity?.displayName ||
      connection.identity?.providerUserId ||
      connection.label
    : "";

  return (
    <Dialog.Root
      onOpenChange={onOpenChange}
      open={connection !== undefined}
      size="sm"
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              if (connection) onSubmit(connection.id, label);
            }}
          >
            <Dialog.Header>
              <Dialog.Title>{t("Rename.Title")}</Dialog.Title>
              {connection && (
                <Dialog.Description>
                  {PROVIDER_NAMES[connection.provider]} ·{" "}
                  {accountLabel(connection)}
                </Dialog.Description>
              )}
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>{t("Rename.Label")}</Field.Label>
                <Field.Control
                  autoComplete="off"
                  autoFocus
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder={fallback}
                  value={label}
                />
                <Field.Description>{t("Rename.Description")}</Field.Description>
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="secondary"
              >
                {t("Common.Cancel")}
              </Button>
              <Button type="submit">{t("Common.Save")}</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
