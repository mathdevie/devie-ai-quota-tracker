import { useTranslation } from "react-i18next";
import type { ProviderConnection } from "@/lib/contracts";
import { accountLabel, PROVIDER_NAMES, visibleWindows } from "@/lib/labels";
import { StatusBadge } from "./ConnectionCard";
import styles from "./PopoverRow.module.scss";
import ProviderIcon from "./ProviderIcon";
import QuotaBars from "./QuotaBars";

/** One account in the menu bar popover: a flat row, no card frame. */
export default function PopoverRow({
  connection,
  pinnedKey,
  onPin,
}: {
  connection: ProviderConnection;
  /** The quota window the menu bar shows, when it belongs to this account. */
  pinnedKey?: string;
  onPin: (windowKey: string) => void;
}) {
  const { t } = useTranslation();
  const plan = connection.identity?.plan;
  const windows = visibleWindows(connection);
  return (
    <article className={styles.row}>
      <header className={styles.header}>
        <ProviderIcon provider={connection.provider} size={20} />
        <p className={styles.identity}>
          <strong>{PROVIDER_NAMES[connection.provider]}</strong>
          <span>
            {" · "}
            {accountLabel(connection)}
            {plan && ` · ${plan}`}
          </span>
        </p>
        <StatusBadge connection={connection} />
      </header>
      {windows.length > 0 ? (
        <QuotaBars
          onPin={onPin}
          pinnedKey={pinnedKey}
          size="sm"
          windows={windows}
        />
      ) : (
        <p className={styles.empty}>
          {connection.windows.length > 0
            ? t("Connection.AllBarsHidden")
            : (connection.lastError ?? t("Connection.NoQuotaData"))}
        </p>
      )}
    </article>
  );
}
