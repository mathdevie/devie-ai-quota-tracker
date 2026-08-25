import { ChevronRight } from "lucide-react";
import type { DashboardState, Provider } from "@/lib/contracts";
import ProviderIcon, { PROVIDER_NAMES } from "../ProviderIcon";
import styles from "./views.module.scss";

export const PROVIDERS: Provider[] = ["claude", "codex", "copilot"];

const DESCRIPTIONS: Record<Provider, string> = {
  claude: "Claude Pro and Max subscriptions",
  codex: "ChatGPT Plus, Pro, and Team subscriptions",
  copilot: "GitHub Copilot plans",
};

export default function ProvidersView({
  state,
  onOpen,
}: {
  state: DashboardState;
  onOpen: (provider: Provider) => void;
}) {
  return (
    <section className={styles.page}>
      <div className={styles.grid}>
        {PROVIDERS.map((provider) => {
          const connections = state.connections.filter(
            (connection) => connection.provider === provider,
          );
          const active = connections.filter(
            (connection) => connection.enabled && connection.status === "ready",
          ).length;
          const attention = connections.filter(
            (connection) =>
              connection.enabled &&
              (connection.status === "needs_login" ||
                connection.status === "error"),
          ).length;
          return (
            <button
              className={styles.providerCard}
              key={provider}
              onClick={() => onOpen(provider)}
              type="button"
            >
              <ProviderIcon provider={provider} size={22} />
              <span className={styles.providerCardText}>
                <strong>{PROVIDER_NAMES[provider]}</strong>
                <small>{DESCRIPTIONS[provider]}</small>
                <span className={styles.providerCount}>
                  {connections.length === 0 ? (
                    <span data-tone="muted">No connections</span>
                  ) : (
                    <>
                      <span data-tone={active > 0 ? "ok" : "muted"}>
                        {active} of {connections.length} ready
                      </span>
                      {attention > 0 && (
                        <span data-tone="warn">{attention} need attention</span>
                      )}
                    </>
                  )}
                </span>
              </span>
              <ChevronRight className={styles.chevron} size={16} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
