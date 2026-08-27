"use client";

import { Toast } from "@base-ui/react/toast";
import { Copy, ExternalLink, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { copyText } from "@/lib/clipboard";
import type { RemoteAccess } from "@/lib/contracts";
import { openExternalUrl } from "@/lib/desktop";
import Button from "@/ui/Button";
import NumberField from "@/ui/NumberField";
import Switch from "@/ui/Switch";
import styles from "./RemoteAccessSettings.module.scss";
import SettingRow from "./SettingRow";

const MIN_PORT = 1024;
const MAX_PORT = 65535;
const GUIDE_URL =
  "https://github.com/mathdevie/devie-quota/blob/main/docs/remote-access.md";

export interface RemoteAccessChange {
  enabled: boolean;
  port: number;
  lan: boolean;
}

/** The link another device opens. The token rides in the fragment. */
function shareLink(access: RemoteAccess): string | undefined {
  const url = access.urls[0];
  if (!url || !access.token) return undefined;
  return `${url}/#token=${access.token}`;
}

/**
 * The "Remote dashboard" rows in Settings: the switch, the port, the network
 * scope, the address to open, the token, and the Cloudflare Tunnel command.
 */
export default function RemoteAccessSettings({
  access,
  busy = false,
  onChange,
  onRegenerateToken,
}: {
  access: RemoteAccess;
  busy?: boolean;
  onChange: (change: RemoteAccessChange) => void;
  onRegenerateToken: () => void;
}) {
  const { t } = useTranslation();
  const toasts = Toast.useToastManager();
  const [port, setPort] = useState(access.port);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    setPort(access.port);
  }, [access.port]);

  async function copy(text: string) {
    const copied = await copyText(text);
    toasts.add({
      type: copied ? "success" : "error",
      description: copied
        ? t("Settings.Remote.Copied")
        : t("Settings.Remote.CopyFailed"),
    });
  }

  function commitPort() {
    const next = Math.min(MAX_PORT, Math.max(MIN_PORT, Math.round(port)));
    setPort(next);
    if (next !== access.port) {
      onChange({ enabled: access.enabled, port: next, lan: access.lan });
    }
  }

  const link = shareLink(access);
  const tunnelCommand = `cloudflared tunnel --url http://localhost:${access.port}`;
  const maskedToken = access.token ? "•".repeat(24) : "";

  return (
    <>
      <SettingRow.Row
        subtitle={t("Settings.Remote.Description")}
        title={t("Settings.Remote.Title")}
      >
        <Switch.Root
          aria-label={t("Settings.Remote.Enable")}
          checked={access.enabled}
          disabled={busy}
          onCheckedChange={(enabled) =>
            onChange({ enabled, port: access.port, lan: access.lan })
          }
        >
          <Switch.Thumb />
        </Switch.Root>
      </SettingRow.Row>

      {access.enabled && (
        <>
          <SettingRow.Row
            subtitle={t("Settings.Remote.PortDescription")}
            title={t("Settings.Remote.Port")}
          >
            <NumberField.Root
              aria-label={t("Settings.Remote.Port")}
              disabled={busy}
              max={MAX_PORT}
              min={MIN_PORT}
              onValueChange={(value) => value !== null && setPort(value)}
              step={1}
              value={port}
            >
              <NumberField.Group>
                <NumberField.Decrement />
                <NumberField.Input
                  className={styles.portInput}
                  onBlur={commitPort}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commitPort();
                  }}
                />
                <NumberField.Increment />
              </NumberField.Group>
            </NumberField.Root>
          </SettingRow.Row>

          <SettingRow.Row
            subtitle={t("Settings.Remote.LanDescription")}
            title={t("Settings.Remote.Lan")}
          >
            <Switch.Root
              aria-label={t("Settings.Remote.LanSwitch")}
              checked={access.lan}
              disabled={busy}
              onCheckedChange={(lan) =>
                onChange({ enabled: true, port: access.port, lan })
              }
            >
              <Switch.Thumb />
            </Switch.Root>
          </SettingRow.Row>

          <SettingRow.Row
            subtitle={
              access.error ? (
                <span className={styles.danger}>{access.error}</span>
              ) : access.urls.length > 0 ? (
                <span className={styles.urls}>
                  {access.urls.map((url) => (
                    <code key={url}>{url}</code>
                  ))}
                  <span>{t("Settings.Remote.AddressDescription")}</span>
                </span>
              ) : (
                t("Settings.Remote.Starting")
              )
            }
            title={t("Settings.Remote.Address")}
          >
            <Button
              disabled={!link}
              onClick={() => link && void copy(link)}
              size="sm"
              variant="secondary"
            >
              <Copy size={14} />
              {t("Settings.Remote.CopyLink")}
            </Button>
          </SettingRow.Row>

          <SettingRow.Row
            subtitle={
              <span className={styles.token}>
                <code>{showToken ? access.token : maskedToken}</code>
                <span>{t("Settings.Remote.TokenDescription")}</span>
              </span>
            }
            title={t("Settings.Remote.Token")}
          >
            <Button
              aria-label={
                showToken
                  ? t("Settings.Remote.Hide")
                  : t("Settings.Remote.Show")
              }
              onClick={() => setShowToken((current) => !current)}
              size="sm"
              variant="icon-secondary"
            >
              {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
            </Button>
            <Button
              aria-label={t("Settings.Remote.Copy")}
              disabled={!access.token}
              onClick={() => access.token && void copy(access.token)}
              size="sm"
              variant="icon-secondary"
            >
              <Copy size={14} />
            </Button>
            <Button
              disabled={busy}
              onClick={onRegenerateToken}
              size="sm"
              variant="secondary"
            >
              <RefreshCw size={14} />
              {t("Settings.Remote.Regenerate")}
            </Button>
          </SettingRow.Row>

          <SettingRow.Row
            subtitle={
              <span className={styles.token}>
                <code>{tunnelCommand}</code>
                <span>{t("Settings.Remote.TunnelDescription")}</span>
              </span>
            }
            title={t("Settings.Remote.Tunnel")}
          >
            <Button
              aria-label={t("Settings.Remote.Copy")}
              onClick={() => void copy(tunnelCommand)}
              size="sm"
              variant="icon-secondary"
            >
              <Copy size={14} />
            </Button>
            <Button
              onClick={() => void openExternalUrl(GUIDE_URL)}
              size="sm"
              variant="secondary"
            >
              <ExternalLink size={14} />
              {t("Settings.Remote.Guide")}
            </Button>
          </SettingRow.Row>
        </>
      )}
    </>
  );
}
