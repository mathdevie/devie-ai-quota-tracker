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
      className={styles.providerCard}
      onClick={() => onOpen(provider)}
      type="button"
    >
      <span className={styles.providerCardHeader}>
        <ProviderIcon provider={provider} size={26} />
        <span className={styles.providerCardTitle}>
          <strong>{PROVIDER_NAMES[provider]}</strong>
          <small>
            {connections.length === 0
              ? "Ready to connect"
              : `${connections.length} account${connections.length === 1 ? "" : "s"}`}
          </small>
        </span>
        <ChevronRight className={styles.chevron} size={16} />
      </span>
      <span className={styles.providerBadges}>
        {connected > 0 && (
          <Badge variant="success">Connected {connected}</Badge>
        )}
        {attention > 0 && (
          <Badge variant="warning">Attention {attention}</Badge>
        )}
        {connections.length === 0 && <Badge>Available</Badge>}
      </span>
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
          <div className={styles.providerGrid}>
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
          <div className={styles.providerGrid}>
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
        <div className={styles.providerGrid}>
          {UNSUPPORTED.map((name) => (
            <article className={styles.providerCard} data-muted key={name}>
              <LetterIcon name={name} />
              <span className={styles.providerCardTitle}>
                <strong>{name}</strong>
                <small>Planned provider</small>
              </span>
              <Badge>Planned</Badge>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
