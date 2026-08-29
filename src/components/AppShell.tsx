"use client";

import { Toast } from "@base-ui/react/toast";
import { Gauge, LoaderCircle, Plug, Settings } from "lucide-react";
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
  sendTestNotification,
  setAutoPing,
  setConnectionAlerts,
  setConnectionEnabled,
  setHiddenWindows,
  setMenuBarItemVisible,
  setUpdateChannel,
  spendResetCredit,
} from "@/lib/desktop";
import { PROVIDER_NAMES } from "@/lib/labels";
import ScrollArea from "@/ui/ScrollArea";
import { Toaster } from "@/ui/Toaster";
import Tooltip from "@/ui/Tooltip";
import AlertsDialog from "./AlertsDialog";
import styles from "./AppShell.module.scss";
import AutoPingDialog from "./AutoPingDialog";
import LoginDialog from "./LoginDialog";
import PopoverSurface from "./PopoverSurface";
import QuotaBarsDialog from "./QuotaBarsDialog";
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

interface AppPage {
  view: View;
  provider?: Provider;
}

const NAV: SidebarItem<View>[] = [
  { value: "quota", label: "Nav.Quota", icon: Gauge, tint: "#2f7cf6" },
  { value: "providers", label: "Nav.Providers", icon: Plug, tint: "#34a853" },
  { value: "settings", label: "Nav.Settings", icon: Settings, tint: "#8e8e93" },
];

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

function isSamePage(first: AppPage, second: AppPage): boolean {
  return first.view === second.view && first.provider === second.provider;
}

export default function AppShell() {
  return (
    <Toast.Provider timeout={6000}>
      <Tooltip.Provider>
        <Shell />
      </Tooltip.Provider>
      <Toaster />
    </Toast.Provider>
  );
}

function Shell() {
  const { t } = useTranslation();
  const toasts = Toast.useToastManager();
  const [state, setState] = useState<DashboardState | null>(null);
  const [page, setPage] = useState<AppPage>({ view: "quota" });
  const [backStack, setBackStack] = useState<AppPage[]>([]);
  const [forwardStack, setForwardStack] = useState<AppPage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [login, setLogin] = useState({ open: false });
  const [renaming, setRenaming] = useState<ProviderConnection>();
  const [barsFor, setBarsFor] = useState<ProviderConnection>();
  const [alertsFor, setAlertsFor] = useState<ProviderConnection>();
  const [autoPingFor, setAutoPingFor] = useState<ProviderConnection>();
  const [surface, setSurface] = useState<"main" | "popover">("main");
  const view = page.view;
  const providerPage = page.provider;

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

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void load();
    if (isDesktop()) {
      void import("@tauri-apps/api/event").then(({ listen }) =>
        listen<DashboardState>("quota:updated", (event) =>
          setState(event.payload),
        ).then((stop) => {
          if (cancelled) void stop();
          else cleanup = stop;
        }),
      );
    }
    return () => {
      cancelled = true;
      cleanup?.();
    };
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

  const onRefresh = (id: string) =>
    void run(() => refreshConnection(id), withBusyId(id));
  const actions = {
    onRefresh,
    onRename: setRenaming,
    onBars: setBarsFor,
    onAlerts: setAlertsFor,
    onAutoPing: setAutoPingFor,
    onEnabledChange: (id: string, enabled: boolean) =>
      void run(() => setConnectionEnabled(id, enabled), withBusyId(id)),
    onRemove: (id: string) =>
      void run(() => removeConnection(id), withBusyId(id)),
    onUseReset: (id: string, creditId: string) =>
      run(() => spendResetCredit(id, creditId), withBusyId(id)),
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

  async function handleAlertsTest(id: string): Promise<boolean> {
    if (!(await ensureNotificationPermission())) {
      showError(t("Alerts.PermissionRequired"));
      return false;
    }
    try {
      await sendTestNotification(id);
      toasts.add({ type: "success", description: t("Alerts.TestSent") });
      return true;
    } catch (reason) {
      showError(reason);
      return false;
    }
  }

  function navigate(next: AppPage) {
    if (isSamePage(page, next)) return;
    setBackStack((history) => [...history, page]);
    setForwardStack([]);
    setPage(next);
  }

  function changeView(next: View) {
    navigate({ view: next });
  }

  function goBack() {
    const previous = backStack.at(-1);
    if (!previous) return;
    setBackStack((history) => history.slice(0, -1));
    setForwardStack((history) => [...history, page]);
    setPage(previous);
  }

  function goForward() {
    const next = forwardStack.at(-1);
    if (!next) return;
    setForwardStack((history) => history.slice(0, -1));
    setBackStack((history) => [...history, page]);
    setPage(next);
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
            backLabel={t("Nav.Back")}
            canGoBack={backStack.length > 0}
            canGoForward={forwardStack.length > 0}
            forwardLabel={t("Nav.Forward")}
            onBack={goBack}
            onForward={goForward}
            title={title}
          />

          <ScrollArea.Root className={styles.main} render={<main />}>
            <ScrollArea.Viewport className={styles.viewport}>
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
                <ProvidersView
                  onOpen={(provider) =>
                    navigate({ view: "providers", provider })
                  }
                  state={state}
                />
              )}
              {onProviderPage && (
                <ProviderDetailView
                  busyId={busyId}
                  onAdd={() => setLogin({ open: true })}
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
                  onUpdateChannelChange={(channel) =>
                    run(() => setUpdateChannel(channel), setSettingsBusy)
                  }
                  state={state}
                />
              )}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>

        {providerPage && (
          <LoginDialog
            onConnected={setState}
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
        <QuotaBarsDialog
          connection={barsFor}
          onOpenChange={(open) => !open && setBarsFor(undefined)}
          onSubmit={(id, hiddenKeys) =>
            run(() => setHiddenWindows(id, hiddenKeys), withBusyId(id))
          }
        />
        <AlertsDialog
          connection={alertsFor}
          onOpenChange={(open) => !open && setAlertsFor(undefined)}
          onSubmit={handleAlertsSubmit}
          onTest={handleAlertsTest}
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
