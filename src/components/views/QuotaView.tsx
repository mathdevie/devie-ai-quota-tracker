import type { DashboardState } from "@/lib/contracts";
import ConnectionCard from "../ConnectionCard";
import styles from "./views.module.scss";

export default function QuotaView({ state }: { state: DashboardState }) {
  const enabled = state.connections.filter((connection) => connection.enabled);
  return (
    <section className={styles.page}>
      <div className={styles.list}>
        {enabled.map((connection) => (
          <ConnectionCard connection={connection} key={connection.id} />
        ))}
        {enabled.length === 0 && (
          <p className={styles.empty}>No enabled providers</p>
        )}
      </div>
    </section>
  );
}
