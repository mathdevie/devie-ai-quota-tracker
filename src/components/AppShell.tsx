"use client";

import { Toast } from "@base-ui/react/toast";
import { LoaderCircle } from "lucide-react";
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
import TitleBar from "./TitleBar";
import { AppUpdaterProvider } from "./updater/AppUpdater";
import UpdateBadge from "./updater/UpdateBadge";
import ProviderDetailView from "./views/ProviderDetailView";
import QuotaView from "./views/QuotaView";
import SettingsView from "./views/SettingsView";

type View = "quota" | "settings";

interface AppPage {
  view: View;
  /** Set on the detail page of one provider, reached from Settings. */
  provider?: Provider;
}

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
  const [page, setPage] = useState<AppPage>({ view: "quota" });
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [login, setLogin] = useState({ open: false });
  const [renaming, setRenaming] = useState<ProviderConnection>();
  const [barsFor, setBarsFor] = useState<ProviderConnection>();
  const [alertsFor, setAlertsFor] = useState<ProviderConnection>();
  const [autoPingFor, setAutoPingFor] = useState<ProviderConnection>();
  const [surface, setSurface] = useState<"main" | "popover">("main");
  const [desktop, setDesktop] = useState(false);
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
    setDesktop(isDesktop());

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

  const onProviderPage = providerPage !== undefined;
  const title = onProviderPage
    ? PROVIDER_NAMES[providerPage]
    : t(view === "settings" ? "Nav.Settings" : "Nav.Quota");
  // A provider page goes up to Settings with the arrow; anywhere inside
  // Settings, the cross at the right closes back to the dashboard.
  const leading = onProviderPage
    ? {
        icon: "back" as const,
        label: t("Nav.Back"),
        onClick: () => setPage({ view: "settings" }),
      }
    : undefined;
  const trailing =
    view === "settings"
      ? {
          icon: "close" as const,
          label: t("Nav.Close"),
          onClick: () => setPage({ view: "quota" }),
        }
      : {
          icon: "settings" as const,
          label: t("Nav.Settings"),
          onClick: () => setPage({ view: "settings" }),
        };

  return (
    <AppUpdaterProvider>
      <div className={styles.shell}>
        <TitleBar
          actions={<UpdateBadge />}
          leading={leading}
          title={title}
          trailing={trailing}
          windowControlsInset={desktop}
        />

        <ScrollArea.Root className={styles.main} render={<main />}>
          <ScrollArea.Viewport className={styles.viewport}>
            {view === "quota" && (
              <QuotaView
                busyId={busyId}
                onOpenProviders={() => setPage({ view: "settings" })}
                onRefreshAll={() => void handleRefresh()}
                refreshing={refreshing}
                state={state}
                {...actions}
              />
            )}
            {onProviderPage && (
              <ProviderDetailView
                busyId={busyId}
                onAdd={() => setLogin({ open: true })}
                onBack={() => setPage({ view: "settings" })}
                provider={providerPage}
                state={state}
                {...actions}
              />
            )}
            {view === "settings" && !onProviderPage && (
              <SettingsView
                busy={settingsBusy}
                onMenuBarItemChange={(visible) =>
                  void run(
                    () => setMenuBarItemVisible(visible),
                    setSettingsBusy,
                  )
                }
                onClose={() => setPage({ view: "quota" })}
                onOpenProvider={(provider) =>
                  setPage({ view: "settings", provider })
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
