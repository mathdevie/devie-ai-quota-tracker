"use client";

import { AppWindowMac, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardState, TraySummary } from "@/lib/contracts";
import {
  listenFilters,
  openMainWindow,
  resizePopover,
  setTraySummary,
} from "@/lib/desktop";
import {
  applyFilters,
  DEFAULT_FILTERS,
  type Filters,
  readFilters,
} from "@/lib/filters";
import Button from "@/ui/Button";
import PopoverRow from "./PopoverRow";
import styles from "./PopoverSurface.module.scss";

/** The Tauri window caps the height at this value; the list scrolls past it. */
const MAX_HEIGHT = 760;
const MIN_HEIGHT = 120;

export default function PopoverSurface({
  state,
  refreshing,
  onRefresh,
  onStateChange,
}: {
  state: DashboardState;
  refreshing: boolean;
  onRefresh: () => void;
  onStateChange: (next: DashboardState) => void;
}) {
  const { t } = useTranslation();
  // The Quota page owns the filters and broadcasts every change.
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  useEffect(() => {
    setFilters(readFilters());
    let stop: (() => void) | undefined;
    void listenFilters(setFilters).then((unlisten) => {
      stop = unlisten;
    });
    return () => stop?.();
  }, []);

  // The window follows the content height.
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    const content = contentRef.current;
    if (!header || !content) return;
    const fit = () => {
      const height = header.offsetHeight + content.offsetHeight;
      void resizePopover(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, height)));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(content);
    fit();
    return () => observer.disconnect();
  }, []);

  const connections = useMemo(
    () => applyFilters(state.connections, filters),
    [state.connections, filters],
  );
  const pinned = state.settings.traySummary;

  async function pin(summary: TraySummary) {
    const same =
      pinned?.connectionId === summary.connectionId &&
      pinned.windowKey === summary.windowKey;
    try {
      onStateChange(await setTraySummary(same ? null : summary));
    } catch (reason) {
      console.error(reason);
    }
  }

  return (
    <main className={styles.popover}>
      <header className={styles.header} data-tauri-drag-region ref={headerRef}>
        <Button onClick={() => void openMainWindow()} size="sm" variant="naked">
          <AppWindowMac size={14} />
          {t("Popover.OpenDashboard")}
        </Button>
        <Button
          aria-label={t("Quota.RefreshQuotas")}
          disabled={refreshing}
          onClick={onRefresh}
          size="sm"
          variant="icon-naked"
        >
          <RefreshCw
            className={refreshing ? styles.spinning : undefined}
            size={14}
          />
        </Button>
      </header>

      <section className={styles.list}>
        <div ref={contentRef}>
          {connections.map((connection) => (
            <PopoverRow
              connection={connection}
              key={connection.id}
              onPin={(windowKey) =>
                void pin({ connectionId: connection.id, windowKey })
              }
              pinnedKey={
                pinned?.connectionId === connection.id
                  ? pinned.windowKey
                  : undefined
              }
            />
          ))}
          {connections.length === 0 && (
            <p className={styles.empty}>{t("Popover.NoProviders")}</p>
          )}
        </div>
      </section>
    </main>
  );
}
