"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/ui/Button";
import Field from "@/ui/Field";
import styles from "./RemoteTokenGate.module.scss";

/**
 * Asks a remote browser for the access token once. The token comes from
 * Settings › Remote dashboard in the app on the Mac.
 */
export default function RemoteTokenGate({
  wrong = false,
  busy = false,
  onSubmit,
}: {
  /** True after the server refused a token the page already had. */
  wrong?: boolean;
  busy?: boolean;
  onSubmit: (token: string) => void;
}) {
  const { t } = useTranslation();
  const [token, setToken] = useState("");

  return (
    <main className={styles.gate}>
      <form
        className={styles.card}
        onSubmit={(event) => {
          event.preventDefault();
          if (token.trim()) onSubmit(token.trim());
        }}
      >
        <div className={styles.icon}>
          <KeyRound size={20} />
        </div>
        <h1>{t("Common.AppName")}</h1>
        <p>{t("Settings.Remote.Gate.Description")}</p>
        <Field.Root>
          <Field.Label>{t("Settings.Remote.Gate.Label")}</Field.Label>
          <Field.Control
            autoComplete="off"
            autoFocus
            onChange={(event) => setToken(event.target.value)}
            spellCheck={false}
            type="password"
            value={token}
          />
          {wrong && (
            <p className={styles.error}>{t("Settings.Remote.Gate.Wrong")}</p>
          )}
        </Field.Root>
        <Button disabled={!token.trim()} isLoading={busy} type="submit">
          {t("Settings.Remote.Gate.Submit")}
        </Button>
      </form>
    </main>
  );
}
