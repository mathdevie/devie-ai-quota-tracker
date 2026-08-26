"use client";

import { Check, Copy, ExternalLink, LoaderCircle } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardState, LoginStart, Provider } from "@/lib/contracts";
import { cancelLogin, finishLogin, startLogin } from "@/lib/desktop";
import Button from "@/ui/Button";
import Dialog from "@/ui/Dialog";
import Field from "@/ui/Field";
import styles from "./LoginDialog.module.scss";
import ProviderIcon, { PROVIDER_NAMES } from "./ProviderIcon";

type Phase = "starting" | "waiting" | "done" | "error";

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

export default function LoginDialog({
  provider,
  open,
  onOpenChange,
  onConnected,
}: {
  provider: Provider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (state: DashboardState) => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("starting");
  const [start, setStart] = useState<LoginStart>();
  const [error, setError] = useState<string>();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const sessionRef = useRef<string>(undefined);
  // The parent passes new callbacks on every render. The effect must not
  // restart the sign-in when that happens, so it reads them through refs.
  const onConnectedRef = useRef(onConnected);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onConnectedRef.current = onConnected;
    onOpenChangeRef.current = onOpenChange;
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPhase("starting");
    setStart(undefined);
    setError(undefined);
    setCode("");
    setCopied(false);

    void (async () => {
      try {
        const started = await startLogin(provider);
        if (cancelled) {
          void cancelLogin(started.sessionId);
          return;
        }
        sessionRef.current = started.sessionId;
        setStart(started);
        setPhase("waiting");
        const state = await finishLogin(started.sessionId);
        if (cancelled) return;
        sessionRef.current = undefined;
        setPhase("done");
        onConnectedRef.current(state);
        window.setTimeout(() => onOpenChangeRef.current(false), 900);
      } catch (reason) {
        if (cancelled) return;
        sessionRef.current = undefined;
        setError(errorMessage(reason));
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      const session = sessionRef.current;
      sessionRef.current = undefined;
      if (session) void cancelLogin(session);
    };
  }, [open, provider]);

  async function handleManualCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = sessionRef.current;
    if (!session || !code.trim()) return;
    // The pasted code replaces the browser callback for this session.
    sessionRef.current = undefined;
    setPhase("starting");
    try {
      const state = await finishLogin(session, code.trim());
      setPhase("done");
      onConnected(state);
      window.setTimeout(() => onOpenChange(false), 900);
    } catch (reason) {
      setError(errorMessage(reason));
      setPhase("error");
    }
  }

  async function copyUserCode() {
    if (!start?.userCode) return;
    try {
      await navigator.clipboard.writeText(start.userCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable
    }
  }

  const name = PROVIDER_NAMES[provider];

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open} size="sm">
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Header>
            <Dialog.Title>
              <span className={styles.title}>
                <ProviderIcon provider={provider} size={18} />
                {t("Login.Title", { name })}
              </span>
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <div className={styles.body}>
              {phase === "starting" && (
                <p className={styles.status}>
                  <LoaderCircle className={styles.spinning} size={16} />
                  {t("Login.OpeningBrowser")}
                </p>
              )}

              {phase === "waiting" && start && (
                <>
                  <p className={styles.hint}>{t(`Login.Hint.${provider}`)}</p>
                  {start.userCode && (
                    <button
                      className={styles.userCode}
                      onClick={() => void copyUserCode()}
                      type="button"
                    >
                      <span>{start.userCode}</span>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                  <p className={styles.status}>
                    <LoaderCircle className={styles.spinning} size={16} />
                    {t("Login.WaitingFor", { name })}
                  </p>
                  <a
                    className={styles.link}
                    href={start.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={13} />
                    {t("Login.OpenPageAgain")}
                  </a>
                  {start.acceptsManualCode && (
                    <form className={styles.manual} onSubmit={handleManualCode}>
                      <Field.Root>
                        <Field.Label>{t("Login.PasteCode")}</Field.Label>
                        <Field.Control
                          autoComplete="off"
                          onChange={(event) => setCode(event.target.value)}
                          placeholder={t("Login.CodePlaceholder")}
                          spellCheck={false}
                          value={code}
                        />
                      </Field.Root>
                      <Button
                        disabled={!code.trim()}
                        size="sm"
                        type="submit"
                        variant="secondary"
                      >
                        {t("Login.UseCode")}
                      </Button>
                    </form>
                  )}
                </>
              )}

              {phase === "done" && (
                <p className={styles.success}>
                  <Check size={16} />
                  {t("Login.Connected")}
                </p>
              )}

              {phase === "error" && <p className={styles.error}>{error}</p>}
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            {phase === "error" ? (
              <>
                <Button
                  onClick={() => onOpenChange(false)}
                  size="sm"
                  variant="naked"
                >
                  {t("Common.Close")}
                </Button>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    window.setTimeout(() => onOpenChange(true), 50);
                  }}
                  size="sm"
                >
                  {t("Common.TryAgain")}
                </Button>
              </>
            ) : (
              <Button
                disabled={phase === "done"}
                onClick={() => onOpenChange(false)}
                size="sm"
                variant="naked"
              >
                {t("Common.Cancel")}
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
