import { ChevronRight } from "lucide-react";
import type { DashboardState, Provider } from "@/lib/contracts";
import { PROVIDER_NAMES, PROVIDERS } from "@/lib/labels";
import Badge from "@/ui/Badge";
import ProviderIcon, { LetterIcon } from "../ProviderIcon";
import styles from "./views.module.scss";

/** Subscription tools other quota trackers cover. Not read by Devie Quota yet. */
const UNSUPPORTED = [
  "Antigravity",
  "Cursor",
  "Gemini CLI",
  "Kiro",
  "Kimchi",
  "OpenCode",
  "Qwen Code",
  "Kilo Code",
  "Cline",
  "Windsurf",
  "OpenRouter",
];

function ProviderRow({
  provider,
  state,
  onOpen,
}: {
  provider: Provider;
  state: DashboardState;
  onOpen: (provider: Provider) => void;
}) {
  const connections = state.connections.filter(
    (connection) => connection.provider === provider,
  );
  const connected = connections.filter(
    (connection) => connection.enabled && connection.status !== "error",
  ).length;
  const attention = connections.filter(
    (connection) =>
      connection.enabled &&
      (connection.status === "needs_login" || connection.status === "error"),
  ).length;
  return (
    <button
      className={styles.providerRow}
      onClick={() => onOpen(provider)}
      type="button"
    >
      <ProviderIcon provider={provider} size={20} />
      <strong>{PROVIDER_NAMES[provider]}</strong>
      <span className={styles.providerBadges}>
        {connected > 0 && (
          <Badge variant="success">{connected} connected</Badge>
        )}
        {attention > 0 && (
          <Badge variant="warning">
            {attention} need{attention === 1 ? "s" : ""} attention
          </Badge>
        )}
      </span>
      <ChevronRight className={styles.chevron} size={16} />
    </button>
  );
}

export default function ProvidersView({
  state,
  onOpen,
}: {
  state: DashboardState;
  onOpen: (provider: Provider) => void;
}) {
  const active = PROVIDERS.filter((provider) =>
    state.connections.some((connection) => connection.provider === provider),
  );
  const available = PROVIDERS.filter((provider) => !active.includes(provider));

  return (
    <section className={styles.page}>
      {active.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>Active</h2>
          <div className={styles.list}>
            {active.map((provider) => (
              <ProviderRow
                key={provider}
                onOpen={onOpen}
                provider={provider}
                state={state}
              />
            ))}
          </div>
        </div>
      )}
      {available.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>Available</h2>
          <div className={styles.list}>
            {available.map((provider) => (
              <ProviderRow
                key={provider}
                onOpen={onOpen}
                provider={provider}
                state={state}
              />
            ))}
          </div>
        </div>
      )}
      <div className={styles.group}>
        <h2 className={styles.groupTitle}>Not supported yet</h2>
        <div className={styles.list}>
          {UNSUPPORTED.map((name) => (
            <div className={styles.providerRow} data-muted key={name}>
              <LetterIcon name={name} />
              <strong>{name}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
