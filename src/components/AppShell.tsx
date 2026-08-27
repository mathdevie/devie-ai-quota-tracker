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
  detectMode,
  ensureNotificationPermission,
  getDashboardState,
  type Mode,
  RemoteAuthError,
  refreshAll,
  refreshConnection,
  regenerateRemoteToken,
  removeConnection,
  renameConnection,
  setAutoPing,
  setConnectionAlerts,
  setConnectionEnabled,
  setMenuBarItemVisible,
  setRemoteAccess,
  setRemoteToken,
  spendResetCredit,
} from "@/lib/desktop";
import { PROVIDER_NAMES } from "@/lib/labels";
import Button from "@/ui/Button";
import ScrollArea from "@/ui/ScrollArea";
import { Toaster } from "@/ui/Toaster";
import Tooltip from "@/ui/Tooltip";
import AlertsDialog from "./AlertsDialog";
import styles from "./AppShell.module.scss";
import AutoPingDialog from "./AutoPingDialog";
import IconTip from "./IconTip";
import LoginDialog from "./LoginDialog";
import PopoverSurface from "./PopoverSurface";
import RemoteTokenGate from "./RemoteTokenGate";
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
  { value: "quota", label: "Nav.Quota", icon: Gauge, tint: "#2f7cf6" },
  { value: "providers", label: "Nav.Providers", icon: Plug, tint: "#34a853" },
  { value: "settings", label: "Nav.Settings", icon: Settings, tint: "#8e8e93" },
];

/** How often a remote browser reads the state again. */
const REMOTE_POLL_INTERVAL = 30_000;

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
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
  const [view, setView] = useState<View>("quota");
  const [providerPage, setProviderPage] = useState<Provider>();
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [login, setLogin] = useState({ open: false });
  const [renaming, setRenaming] = useState<ProviderConnection>();
  const [alertsFor, setAlertsFor] = useState<ProviderConnection>();
  const [autoPingFor, setAutoPingFor] = useState<ProviderConnection>();
  const [surface, setSurface] = useState<"main" | "popover">("main");
  const [mode, setMode] = useState<Mode>();
  const [tokenGate, setTokenGate] = useState<{ open: boolean; wrong: boolean }>(
    { open: false, wrong: false },
  );

  const showError = useCallback(
    (reason: unknown) =>
      toasts.add({ type: "error", description: errorMessage(reason) }),
    [toasts],
  );

  const load = useCallback(async () => {
    try {
      setState(await getDashboardState());
      setTokenGate({ open: false, wrong: false });
    } catch (reason) {
      if (reason instanceof RemoteAuthError) {
        // A page with a token that the server refused shows the reason; a
        // page without a token only asks for one.
        setTokenGate((gate) => ({ open: true, wrong: gate.open }));
        return;
      }
      showError(reason);
    }
  }, [showError]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSurface(params.get("surface") === "popover" ? "popover" : "main");

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void detectMode().then((found) => {
      if (cancelled) return;
      setMode(found);
      void load();
      if (found === "native") {
        void import("@tauri-apps/api/event").then(({ listen }) =>
          listen<DashboardState>("quota:updated", (event) =>
            setState(event.payload),
          ).then((stop) => {
            cleanup = stop;
          }),
        );
      } else if (found === "remote") {
        // The Mac refreshes on its own timer; the page reads the result
        // every half minute and when it comes back to the front.
        const timer = window.setInterval(
          () => void load(),
          REMOTE_POLL_INTERVAL,
        );
        const onVisible = () => {
          if (document.visibilityState === "visible") void load();
        };
        document.addEventListener("visibilitychange", onVisible);
        cleanup = () => {
          window.clearInterval(timer);
          document.removeEventListener("visibilitychange", onVisible);
        };
      }
    });
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

  // A remote browser reads and refreshes only. Every change to an account
  // stays in the app on the Mac.
  const remote = mode === "remote";
  const onRefresh = (id: string) =>
    void run(() => refreshConnection(id), withBusyId(id));
  const actions = remote
    ? { onRefresh }
    : {
        onRefresh,
        onRename: setRenaming,
        onAlerts: setAlertsFor,
        onAutoPing: setAutoPingFor,
        onEnabledChange: (id: string, enabled: boolean) =>
          void run(() => setConnectionEnabled(id, enabled), withBusyId(id)),
        onRemove: (id: string) =>
          void run(() => removeConnection(id), withBusyId(id)),
        onUseReset: (id: string, creditId: string) =>
          run(() => spendResetCredit(id, creditId), withBusyId(id)),
      };
  const nav = remote ? NAV.filter((item) => item.value !== "providers") : NAV;

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

  if (tokenGate.open) {
    return (
      <RemoteTokenGate
        onSubmit={(token) => {
          setRemoteToken(token);
          void load();
        }}
        wrong={tokenGate.wrong}
      />
    );
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
    : t(nav.find((item) => item.value === view)?.label ?? "Nav.Quota");

  return (
    <AppUpdaterProvider>
      <div className={styles.shell}>
        <Sidebar
          compact={remote}
          footer={<UpdateButton />}
          items={nav}
          onChange={changeView}
          value={view}
        />

        <div className={styles.content}>
          <TitleBar
            leading={
              onProviderPage && (
                <IconTip label={t("Nav.BackToProviders")}>
                  <Button
                    aria-label={t("Nav.BackToProviders")}
                    onClick={() => setProviderPage(undefined)}
                    size="sm"
                    variant="icon-naked"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                </IconTip>
              )
            }
            title={title}
          />

          <ScrollArea.Root className={styles.main} render={<main />}>
            <ScrollArea.Viewport className={styles.viewport}>
              {view === "quota" && (
                <QuotaView
                  busyId={busyId}
                  onOpenProviders={
                    remote ? undefined : () => changeView("providers")
                  }
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
                  onRegenerateRemoteToken={() =>
                    void run(regenerateRemoteToken, setSettingsBusy)
                  }
                  onRemoteAccessChange={(change) =>
                    void run(() => setRemoteAccess(change), setSettingsBusy)
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
