"use client";

import {
  ChartColumn,
  ChevronLeft,
  Gauge,
  LoaderCircle,
  Plug,
  Plus,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  ConnectionAlerts,
  DashboardState,
  Provider,
  ProviderConnection,
} from "@/lib/contracts";
import {
  ensureNotificationPermission,
  getDashboardState,
  isDesktop,
  refreshAll,
  refreshConnection,
  removeConnection,
  renameConnection,
  setConnectionAutomation,
  setConnectionEnabled,
  setMenuBarItemVisible,
} from "@/lib/desktop";
import { PROVIDER_NAMES } from "@/lib/labels";
import Button from "@/ui/Button";
import styles from "./AppShell.module.scss";
import AutomationDialog from "./AutomationDialog";
import LoginDialog from "./LoginDialog";
import PopoverSurface from "./PopoverSurface";
import RenameDialog from "./RenameDialog";
import Sidebar, { type SidebarItem } from "./Sidebar";
import TitleBar from "./TitleBar";
import { AppUpdaterProvider } from "./updater/AppUpdater";
import UpdateButton from "./updater/UpdateButton";
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

export default function AppShell() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [view, setView] = useState<View>("quota");
  const [providerPage, setProviderPage] = useState<Provider>();
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [loginOpen, setLoginOpen] = useState(false);
  const [renaming, setRenaming] = useState<ProviderConnection>();
  const [configuring, setConfiguring] = useState<ProviderConnection>();
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
  const withBusyId = (id: string) => (busy: boolean) =>
    setBusyId(busy ? id : undefined);

  const actions = {
    onRefresh: (id: string) =>
      void run(() => refreshConnection(id), withBusyId(id)),
    onRename: setRenaming,
    onConfigure: setConfiguring,
    onEnabledChange: (id: string, enabled: boolean) =>
      void run(() => setConnectionEnabled(id, enabled), withBusyId(id)),
    onRemove: (id: string) =>
      void run(() => removeConnection(id), withBusyId(id)),
  };

  const handleConnected = useCallback((nextState: DashboardState) => {
    setState(nextState);
    setError(undefined);
  }, []);

  const handleAutomationSubmit = useCallback(
    async (
      id: string,
      alerts: ConnectionAlerts,
      autoPingEnabled: boolean,
    ): Promise<boolean> => {
      setBusyId(id);
      try {
        const alertsEnabled = Object.values(alerts).some(Boolean);
        if (alertsEnabled && !(await ensureNotificationPermission())) {
          setError(
            "Allow notifications in macOS Settings to use quota alerts.",
          );
          return false;
        }
        setState(await setConnectionAutomation(id, alerts, autoPingEnabled));
        setError(undefined);
        return true;
      } catch (reason) {
        setError(errorMessage(reason));
        return false;
      } finally {
        setBusyId(undefined);
      }
    },
    [],
  );

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
    <AppUpdaterProvider>
      <div className={styles.shell}>
        <Sidebar
          footer={<UpdateButton />}
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
            {view === "quota" && (
              <QuotaView busyId={busyId} state={state} {...actions} />
            )}
            {view === "usage" && <UsageView state={state} />}
            {view === "providers" && !onProviderPage && (
              <ProvidersView onOpen={setProviderPage} state={state} />
            )}
            {onProviderPage && (
              <ProviderDetailView
                busyId={busyId}
                onAdd={() => setLoginOpen(true)}
                provider={providerPage}
                state={state}
                {...actions}
              />
            )}
            {view === "settings" && (
              <SettingsView
                busy={settingsBusy}
                onMenuBarItemChange={(visible) =>
                  void run(
                    () => setMenuBarItemVisible(visible),
                    setSettingsBusy,
                  )
                }
                state={state}
              />
            )}
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
        <RenameDialog
          connection={renaming}
          onOpenChange={(open) => !open && setRenaming(undefined)}
          onSubmit={(id, label) => {
            setRenaming(undefined);
            void run(() => renameConnection(id, label), withBusyId(id));
          }}
        />
        <AutomationDialog
          connection={configuring}
          onOpenChange={(open) => !open && setConfiguring(undefined)}
          onSubmit={handleAutomationSubmit}
        />
      </div>
    </AppUpdaterProvider>
  );
}
