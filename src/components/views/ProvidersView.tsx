import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DashboardState, Provider } from "@/lib/contracts";
import { PROVIDER_NAMES, PROVIDERS } from "@/lib/labels";
import Badge from "@/ui/Badge";
import ProviderIcon, { BrandIcon, type BrandId } from "../ProviderIcon";
import styles from "./views.module.scss";

/** Subscription tools other quota trackers cover. Not read by Devie Quota yet. */
const UNSUPPORTED: { name: string; brand: BrandId }[] = [
  { name: "Antigravity", brand: "antigravity" },
  { name: "Cursor", brand: "cursor" },
  { name: "Kiro", brand: "kiro" },
  { name: "Kimchi", brand: "kimchi" },
  { name: "OpenCode", brand: "opencode" },
  { name: "Qwen Code", brand: "qwen" },
  { name: "Kilo Code", brand: "kilocode" },
  { name: "Cline", brand: "cline" },
  { name: "Windsurf", brand: "windsurf" },
  { name: "OpenRouter", brand: "openrouter" },
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
  const { t } = useTranslation();
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
        <ProviderIcon provider={provider} size={28} />
        <span className={styles.providerCardTitle}>
          <strong>{PROVIDER_NAMES[provider]}</strong>
        </span>
        <ChevronRight className={styles.chevron} size={16} />
      </span>
      {(connected > 0 || attention > 0) && (
        <span className={styles.providerBadges}>
          {connected > 0 && (
            <Badge variant="success">
              {t("Providers.Connected", { total: connected })}
            </Badge>
          )}
          {attention > 0 && (
            <Badge variant="warning">
              {t("Providers.Attention", { total: attention })}
            </Badge>
          )}
        </span>
      )}
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
  const { t } = useTranslation();
  const active = PROVIDERS.filter((provider) =>
    state.connections.some((connection) => connection.provider === provider),
  );
  const available = PROVIDERS.filter((provider) => !active.includes(provider));

  return (
    <section className={styles.page}>
      {active.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>{t("Providers.Active")}</h2>
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
          <h2 className={styles.groupTitle}>{t("Providers.Available")}</h2>
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
        <h2 className={styles.groupTitle}>{t("Providers.NotSupportedYet")}</h2>
        <div className={styles.providerGrid}>
          {UNSUPPORTED.map((tool) => (
            <article
              className={styles.providerCard}
              data-muted
              key={tool.brand}
            >
              <span className={styles.providerCardHeader}>
                <BrandIcon brand={tool.brand} size={28} />
                <span className={styles.providerCardTitle}>
                  <strong>{tool.name}</strong>
                </span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
