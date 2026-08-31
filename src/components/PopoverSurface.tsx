"use client";

import { RefreshCw, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardState, TraySummary } from "@/lib/contracts";
import {
  hidePopover,
  isDesktop,
  openMainWindow,
  resizePopover,
  setTraySummary,
} from "@/lib/desktop";
import {
  applyFilters,
  DEFAULT_FILTERS,
  type Filters,
  readFilters,
  writeFilters,
} from "@/lib/filters";
import Button from "@/ui/Button";
import ScrollArea from "@/ui/ScrollArea";
import Tooltip from "@/ui/Tooltip";
import IconTip from "./IconTip";
import PopoverRow from "./PopoverRow";
import styles from "./PopoverSurface.module.scss";
import QuotaFilters from "./QuotaFilters";

/** The Tauri window caps the height at this value; the list scrolls past it. */
const MAX_HEIGHT = 760;
const MIN_HEIGHT = 120;
/** The top and bottom border of the rounded frame. */
const FRAME = 2;

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
  // The popover keeps its own filters, apart from the main window.
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  useEffect(() => {
    setFilters(readFilters("popover"));
  }, []);

  function updateFilters(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    writeFilters("popover", next);
  }

  // The window is transparent; the surface draws its own rounded frame.
  useEffect(() => {
    document.documentElement.dataset.surface = "popover";
    return () => {
      delete document.documentElement.dataset.surface;
    };
  }, []);

  // The window follows the content height.
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    const content = contentRef.current;
    if (!header || !content) return;
    const fit = () => {
      const height = header.offsetHeight + content.offsetHeight + FRAME;
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

  async function openDashboard() {
    await hidePopover();
    await openMainWindow();
  }

  return (
    <Tooltip.Provider>
      <main
        className={styles.popover}
        data-native-material={isDesktop() || undefined}
      >
        <header className={styles.header} ref={headerRef}>
          <div className={styles.headerGroup}>
            <IconTip label={t("Popover.OpenDashboard")}>
              <Button
                aria-label={t("Popover.OpenDashboard")}
                onClick={() => void openDashboard()}
                size="sm"
                variant="icon-naked"
              >
                <Settings size={14} />
              </Button>
            </IconTip>
            <QuotaFilters compact filters={filters} onChange={updateFilters} />
          </div>
          <IconTip label={t("Quota.RefreshQuotas")}>
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
          </IconTip>
        </header>

        <ScrollArea.Root className={styles.list}>
          <ScrollArea.Viewport className={styles.viewport}>
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
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar>
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </main>
    </Tooltip.Provider>
  );
}
