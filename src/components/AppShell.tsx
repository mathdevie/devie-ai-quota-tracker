"use client";

import { Toast } from "@base-ui/react/toast";
import { ChevronLeft, Gauge, LoaderCircle, Plug, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  setAutoPing,
  setConnectionAlerts,
  setConnectionEnabled,
  setMenuBarItemVisible,
} from "@/lib/desktop";
import { PROVIDER_NAMES } from "@/lib/labels";
import Button from "@/ui/Button";
import { Toaster } from "@/ui/Toaster";
import AlertsDialog from "./AlertsDialog";
import styles from "./AppShell.module.scss";
import AutoPingDialog from "./AutoPingDialog";
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

type View = "quota" | "providers" | "settings";

const NAV: SidebarItem<View>[] = [
  { value: "quota", label: "Nav.Quota", icon: Gauge },
  { value: "providers", label: "Nav.Providers", icon: Plug },
  { value: "settings", label: "Nav.Settings", icon: Settings },
];

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

export default function AppShell() {
  return (
    <Toast.Provider timeout={6000}>
      <Shell />
      <Toaster />
    </Toast.Provider>
  );
}

function Shell() {
  const { t } = useTranslation();
  const toasts = Toast.useToastManager();
  const [state, setState] = useState<DashboardState | null>(null);
  const [view, setView] = useState<View>("quota");
  const [providerPage, setProviderPage] = useState<Provider>();
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [settingsBusy, setSettingsBusy] = useState(false);
  /** `replaces`: an auto-detected account to disable once the sign-in succeeds. */
  const [login, setLogin] = useState<{ open: boolean; replaces?: string }>({
    open: false,
  });
  const [renaming, setRenaming] = useState<ProviderConnection>();
  const [alertsFor, setAlertsFor] = useState<ProviderConnection>();
  const [autoPingFor, setAutoPingFor] = useState<ProviderConnection>();
  const [surface, setSurface] = useState<"main" | "popover">("main");

  const showError = useCallback(
    (reason: unknown) =>
      toasts.add({ type: "error", description: errorMessage(reason) }),
    [toasts],
  );

  const load = useCallback(async () => {
    try {
      setState(await getDashboardState());
    } catch (reason) {
      showError(reason);
    }
  }, [showError]);

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

  /** Runs a state-changing command; failures show a toast. */
  const run = useCallback(
    async (
      action: () => Promise<DashboardState>,
      setBusy?: (busy: boolean) => void,
    ): Promise<boolean> => {
      setBusy?.(true);
      try {
        setState(await action());
        return true;
      } catch (reason) {
        showError(reason);
        return false;
      } finally {
        setBusy?.(false);
      }
    },
    [showError],
  );

  const handleRefresh = () => run(refreshAll, setRefreshing);
  const withBusyId = (id: string) => (busy: boolean) =>
    setBusyId(busy ? id : undefined);

  const actions = {
    onRefresh: (id: string) =>
      void run(() => refreshConnection(id), withBusyId(id)),
    onRename: setRenaming,
    onAlerts: setAlertsFor,
    onAutoPing: setAutoPingFor,
    onEnabledChange: (id: string, enabled: boolean) =>
      void run(() => setConnectionEnabled(id, enabled), withBusyId(id)),
    onRemove: (id: string) =>
      void run(() => removeConnection(id), withBusyId(id)),
  };

  async function handleAlertsSubmit(
    id: string,
    alerts: ConnectionAlerts,
  ): Promise<boolean> {
    const anyEnabled = Object.values(alerts).some(Boolean);
    if (anyEnabled && !(await ensureNotificationPermission())) {
      showError(t("Alerts.PermissionRequired"));
      return false;
    }
    return run(() => setConnectionAlerts(id, alerts), withBusyId(id));
  }

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
        onStateChange={setState}
        refreshing={refreshing}
        state={state}
      />
    );
  }

  const onProviderPage = view === "providers" && providerPage !== undefined;
  const title = onProviderPage
    ? PROVIDER_NAMES[providerPage]
    : t(NAV.find((item) => item.value === view)?.label ?? "Nav.Quota");

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
                  aria-label={t("Nav.BackToProviders")}
                  onClick={() => setProviderPage(undefined)}
                  size="sm"
                  variant="icon-naked"
                >
                  <ChevronLeft size={16} />
                </Button>
              )
            }
            title={title}
          />

          <main className={styles.main}>
            {view === "quota" && (
              <QuotaView
                busyId={busyId}
                onOpenProviders={() => changeView("providers")}
                onRefreshAll={() => void handleRefresh()}
                refreshing={refreshing}
                state={state}
                {...actions}
              />
            )}
            {view === "providers" && !onProviderPage && (
              <ProvidersView onOpen={setProviderPage} state={state} />
            )}
            {onProviderPage && (
              <ProviderDetailView
                busyId={busyId}
                onAdd={(replaces) => setLogin({ open: true, replaces })}
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
            onConnected={(next) => {
              setState(next);
              if (login.replaces) {
                const id = login.replaces;
                void run(() => setConnectionEnabled(id, false), withBusyId(id));
              }
            }}
            onOpenChange={(open) =>
              setLogin((current) => ({ ...current, open }))
            }
            open={login.open}
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
        <AlertsDialog
          connection={alertsFor}
          onOpenChange={(open) => !open && setAlertsFor(undefined)}
          onSubmit={handleAlertsSubmit}
        />
        <AutoPingDialog
          connection={autoPingFor}
          onOpenChange={(open) => !open && setAutoPingFor(undefined)}
          onSubmit={(id, enabled) =>
            run(() => setAutoPing(id, enabled), withBusyId(id))
          }
        />
      </div>
    </AppUpdaterProvider>
  );
}
