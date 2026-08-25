"use client";

import {
  ChartColumn,
  ChevronLeft,
  Gauge,
  LoaderCircle,
  Plug,
  Plus,
  RefreshCw,
  ScanSearch,
  Settings,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DashboardState, Provider } from "@/lib/contracts";
import {
  discoverConnections,
  getDashboardState,
  isDesktop,
  refreshAll,
  refreshConnection,
  removeConnection,
  setClaudeCapture,
  setConnectionEnabled,
} from "@/lib/desktop";
import Button from "@/ui/Button";
import styles from "./AppShell.module.scss";
import LoginDialog from "./LoginDialog";
import PopoverSurface from "./PopoverSurface";
import { PROVIDER_NAMES } from "./ProviderIcon";
import Sidebar, { type SidebarItem } from "./Sidebar";
import TitleBar from "./TitleBar";
import ProviderDetailView from "./views/ProviderDetailView";
import ProvidersView from "./views/ProvidersView";
import QuotaView from "./views/QuotaView";
import SettingsView from "./views/SettingsView";
import UsageView from "./views/UsageView";

type View = "quota" | "usage" | "providers" | "settings";

const NAV: SidebarItem<View>[] = [
  { value: "quota", label: "Quota", icon: Gauge },
  { value: "usage", label: "Usage", icon: ChartColumn },
  { value: "providers", label: "Providers", icon: Plug },
  { value: "settings", label: "Settings", icon: Settings },
];

const TITLES: Record<View, string> = {
  quota: "Quota",
  usage: "Usage",
  providers: "Providers",
  settings: "Settings",
};

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

function latestUpdate(state: DashboardState): string {
  if (!state.refreshedAt) return "Not updated";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(state.refreshedAt));
}

export default function AppShell() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [view, setView] = useState<View>("quota");
  const [providerPage, setProviderPage] = useState<Provider>();
  const [refreshing, setRefreshing] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState<string>();
  const [loginOpen, setLoginOpen] = useState(false);
  const [surface, setSurface] = useState<"main" | "popover">("main");

  const load = useCallback(async () => {
    try {
      setState(await getDashboardState());
      setError(undefined);
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSurface(params.get("surface") === "popover" ? "popover" : "main");
    void load();

    if (!isDesktop()) return;
    let unlisten: (() => void) | undefined;
    void import("@tauri-apps/api/event").then(({ listen }) =>
      listen<DashboardState>("quota:updated", (event) =>
        setState(event.payload),
      ).then((stop) => {
        unlisten = stop;
      }),
    );
    return () => unlisten?.();
  }, [load]);

  /** Runs a state-changing command and stores its result or error. */
  const run = useCallback(
    async (
      action: () => Promise<DashboardState>,
      setBusy?: (busy: boolean) => void,
    ) => {
      setBusy?.(true);
      try {
        setState(await action());
        setError(undefined);
      } catch (reason) {
        setError(errorMessage(reason));
      } finally {
        setBusy?.(false);
      }
    },
    [],
  );

  const handleRefresh = () => run(refreshAll, setRefreshing);
  const handleDiscover = () => run(discoverConnections, setDiscovering);
  const withBusyId = (id: string) => (busy: boolean) =>
    setBusyId(busy ? id : undefined);

  const handleConnected = useCallback((nextState: DashboardState) => {
    setState(nextState);
    setError(undefined);
  }, []);

  function changeView(next: View) {
    setView(next);
    setProviderPage(undefined);
  }

  if (!state) {
    return (
      <main className={styles.loading}>
        <LoaderCircle className={styles.spinning} />
      </main>
    );
  }

  if (surface === "popover") {
    return (
      <PopoverSurface
        onRefresh={() => void handleRefresh()}
        refreshing={refreshing}
        state={state}
      />
    );
  }

  const onProviderPage = view === "providers" && providerPage !== undefined;
  const title = onProviderPage ? PROVIDER_NAMES[providerPage] : TITLES[view];

  return (
    <div className={styles.shell}>
      <Sidebar
        footer={<span>Updated {latestUpdate(state)}</span>}
        items={NAV}
        onChange={changeView}
        value={view}
      />

      <div className={styles.content}>
        <TitleBar
          leading={
            onProviderPage && (
              <Button
                aria-label="Back to providers"
                onClick={() => setProviderPage(undefined)}
                size="sm"
                variant="icon-naked"
              >
                <ChevronLeft size={16} />
              </Button>
            )
          }
          title={title}
        >
          {view === "providers" && !onProviderPage && (
            <Button
              aria-label="Find CLI profiles on this Mac"
              disabled={discovering}
              onClick={() => void handleDiscover()}
              size="sm"
              variant="icon-naked"
            >
              <ScanSearch
                className={discovering ? styles.spinning : undefined}
                size={16}
              />
            </Button>
          )}
          {onProviderPage && (
            <Button onClick={() => setLoginOpen(true)} size="sm">
              <Plus size={15} />
              Add account
            </Button>
          )}
          {(view === "quota" || view === "usage") && (
            <Button
              aria-label="Refresh quotas"
              disabled={refreshing}
              onClick={() => void handleRefresh()}
              size="sm"
              variant="icon-naked"
            >
              <RefreshCw
                className={refreshing ? styles.spinning : undefined}
                size={16}
              />
            </Button>
          )}
        </TitleBar>

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <Button
              onClick={() => setError(undefined)}
              size="sm"
              variant="naked"
            >
              Dismiss
            </Button>
          </div>
        )}

        <main className={styles.main}>
          {view === "quota" && <QuotaView state={state} />}
          {view === "usage" && <UsageView state={state} />}
          {view === "providers" && !onProviderPage && (
            <ProvidersView onOpen={setProviderPage} state={state} />
          )}
          {onProviderPage && (
            <ProviderDetailView
              busyId={busyId}
              onAdd={() => setLoginOpen(true)}
              onCaptureChange={(id, install) =>
                void run(() => setClaudeCapture(id, install), withBusyId(id))
              }
              onEnabledChange={(id, enabled) =>
                void run(
                  () => setConnectionEnabled(id, enabled),
                  withBusyId(id),
                )
              }
              onRefresh={(id) =>
                void run(() => refreshConnection(id), withBusyId(id))
              }
              onRemove={(id) =>
                void run(() => removeConnection(id), withBusyId(id))
              }
              provider={providerPage}
              state={state}
            />
          )}
          {view === "settings" && <SettingsView state={state} />}
        </main>
      </div>

      {providerPage && (
        <LoginDialog
          onConnected={handleConnected}
          onOpenChange={setLoginOpen}
          open={loginOpen}
          provider={providerPage}
        />
      )}
    </div>
  );
}
