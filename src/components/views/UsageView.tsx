import { Info } from "lucide-react";
import type { DashboardState, ProviderConnection } from "@/lib/contracts";
import { accountLabel, PROVIDER_NAMES } from "@/lib/labels";
import Callout from "@/ui/Callout";
import ProviderIcon from "../ProviderIcon";
import styles from "./views.module.scss";

function formatTime(value?: string): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function peakUsage(connection: ProviderConnection): string {
  if (connection.windows.length === 0) return "—";
  const used = Math.max(...connection.windows.map((w) => w.usedPercent));
  return `${Math.round(used)}%`;
}

export default function UsageView({ state }: { state: DashboardState }) {
  const enabled = state.connections.filter((connection) => connection.enabled);
  return (
    <section className={styles.page}>
      <Callout.Root variant="sub">
        <Callout.Icon>
          <Info size={16} />
        </Callout.Icon>
        <Callout.Content title="Usage history">
          Devie Quota stores one snapshot per refresh. Charts over time will use
          this history in a later version.
        </Callout.Content>
      </Callout.Root>

      <div className={styles.list}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Account</th>
              <th>Source</th>
              <th>Peak window</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {enabled.map((connection) => (
              <tr key={connection.id}>
                <td>
                  <span className={styles.cellIdentity}>
                    <ProviderIcon provider={connection.provider} size={16} />
                    <span>
                      <strong>{PROVIDER_NAMES[connection.provider]}</strong>
                      <small>{accountLabel(connection)}</small>
                    </span>
                  </span>
                </td>
                <td>{connection.source || "—"}</td>
                <td className={styles.numeric}>{peakUsage(connection)}</td>
                <td>{formatTime(connection.lastUpdatedAt)}</td>
              </tr>
            ))}
            {enabled.length === 0 && (
              <tr>
                <td className={styles.empty} colSpan={4}>
                  No enabled accounts
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
