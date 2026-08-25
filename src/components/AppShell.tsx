"use client";

import {
  Bot,
  Braces,
  GitPullRequest,
  LoaderCircle,
  Plus,
  RefreshCw,
  ScanSearch,
  TerminalSquare,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  DashboardState,
  Provider,
  ProviderConnection,
} from "@/lib/contracts";
import {
  addProviderAccount,
  discoverConnections,
  getDashboardState,
  isDesktop,
  loginProviderAccount,
  openMainWindow,
  refreshAll,
  setClaudeCapture,
  setConnectionEnabled,
} from "@/lib/desktop";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";
import Switch from "@/ui/Switch";
import Tabs from "@/ui/Tabs";
import AddProviderDialog from "./AddProviderDialog";
import styles from "./AppShell.module.scss";
import BrandMark from "./BrandMark";
import ConnectionCard from "./ConnectionCard";
import ThemeSwitcher from "./ThemeSwitcher";

type View = "usage" | "providers";
type LoginProvider = Extract<Provider, "claude" | "codex">;

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

function remainingPercent(connection: ProviderConnection): number | undefined {
  if (connection.windows.length === 0) return undefined;
  return Math.max(
    0,
    100 - Math.max(...connection.windows.map((window) => window.usedPercent)),
  );
}

function latestUpdate(state: DashboardState): string {
  if (!state.refreshedAt) return "Not updated";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(state.refreshedAt));
}

function ProviderIcon({ provider }: { provider: Provider }) {
  const Icon =
    provider === "claude"
      ? Bot
      : provider === "codex"
        ? Braces
        : GitPullRequest;
  return (
    <span className={styles.providerIcon}>
      <Icon aria-hidden size={17} />
    </span>
  );
}

function ProviderStatus({ connection }: { connection: ProviderConnection }) {
  if (connection.status === "ready") {
    return <Badge variant="success">Ready</Badge>;
  }
  if (connection.status === "stale") {
    return <Badge variant="warning">Stale</Badge>;
  }
  if (connection.status === "needs_login") {
    return <Badge variant="warning">Login required</Badge>;
  }
  return <Badge variant="danger">Error</Badge>;
}

function PopoverSurface({
  state,
  refreshing,
  onRefresh,
}: {
  state: DashboardState;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const enabled = state.connections.filter((connection) => connection.enabled);
  const remaining = enabled
    .map(remainingPercent)
    .filter((value): value is number => value !== undefined);
  const lowest = remaining.length > 0 ? Math.min(...remaining) : undefined;

  return (
    <main className={styles.popover}>
      <header className={styles.popoverHeader} data-tauri-drag-region>
        <div className={styles.brand}>
          <BrandMark size={28} />
          <strong>Devie QT</strong>
        </div>
        <div className={styles.popoverActions}>
          <span className={styles.minimum}>
            {lowest === undefined ? "—" : `${Math.round(lowest)}%`}
          </span>
          <Button
            aria-label="Refresh quotas"
            disabled={refreshing}
            onClick={onRefresh}
            size="sm"
            variant="icon-naked"
          >
            <RefreshCw
              className={refreshing ? styles.spinning : undefined}
              size={16}
            />
          </Button>
        </div>
      </header>

      <section className={styles.popoverList}>
        {enabled.map((connection) => (
          <ConnectionCard compact connection={connection} key={connection.id} />
        ))}
        {enabled.length === 0 && <p className={styles.empty}>No providers</p>}
      </section>

      <footer className={styles.popoverFooter}>
        <span>{latestUpdate(state)}</span>
        <Button onClick={() => void openMainWindow()} size="sm" variant="naked">
          Open
        </Button>
      </footer>
    </main>
  );
}

function UsageView({ state }: { state: DashboardState }) {
  const enabled = state.connections.filter((connection) => connection.enabled);
  return (
    <section className={styles.page}>
      <h1>Usage</h1>
      <div className={styles.list}>
        {enabled.map((connection) => (
          <ConnectionCard connection={connection} key={connection.id} />
        ))}
        {enabled.length === 0 && <p className={styles.empty}>No providers</p>}
      </div>
    </section>
  );
}

function ProvidersView({
  state,
  busyId,
  discovering,
  onAdd,
  onDiscover,
  onEnabledChange,
  onCaptureChange,
  onLogin,
}: {
  state: DashboardState;
  busyId?: string;
  discovering: boolean;
  onAdd: () => void;
  onDiscover: () => void;
  onEnabledChange: (id: string, enabled: boolean) => void;
  onCaptureChange: (id: string, install: boolean) => void;
  onLogin: (id: string) => void;
}) {
  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Providers</h1>
        <div className={styles.pageActions}>
          <Button
            aria-label="Find local profiles"
            disabled={discovering}
            onClick={onDiscover}
            size="sm"
            variant="icon-secondary"
          >
            <ScanSearch
              className={discovering ? styles.spinning : undefined}
              size={15}
            />
          </Button>
          <Button onClick={onAdd} size="sm">
            <Plus size={15} />
            Add subscription
          </Button>
        </div>
      </div>

      <div className={styles.list}>
        {state.connections.map((connection) => {
          const detail =
            connection.identity?.displayName ?? connection.identity?.plan;
          return (
            <article className={styles.providerRow} key={connection.id}>
              <div className={styles.providerMain}>
                <ProviderIcon provider={connection.provider} />
                <div>
                  <h2>{connection.label}</h2>
                  {detail && <p>{detail}</p>}
                  {connection.lastError && connection.status !== "ready" && (
                    <p className={styles.rowError}>{connection.lastError}</p>
                  )}
                </div>
              </div>
              <div className={styles.providerActions}>
                <ProviderStatus connection={connection} />
                {connection.status === "needs_login" &&
                  connection.provider !== "copilot" && (
                    <Button
                      disabled={busyId === connection.id}
                      onClick={() => onLogin(connection.id)}
                      size="sm"
                      variant="secondary"
                    >
                      Login
                    </Button>
                  )}
                {connection.provider === "claude" &&
                  connection.captureState !== "unsupported" && (
                    <Button
                      disabled={busyId === connection.id}
                      onClick={() =>
                        onCaptureChange(
                          connection.id,
                          connection.captureState !== "installed",
                        )
                      }
                      size="sm"
                      variant="secondary"
                    >
                      <TerminalSquare size={14} />
                      {connection.captureState === "installed"
                        ? "Remove capture"
                        : "Enable capture"}
                    </Button>
                  )}
                <Switch.Root
                  aria-label={`${connection.enabled ? "Disable" : "Enable"} ${connection.label}`}
                  checked={connection.enabled}
                  disabled={busyId === connection.id}
                  onCheckedChange={(checked) =>
                    onEnabledChange(connection.id, checked)
                  }
                >
                  <Switch.Thumb />
                </Switch.Root>
              </div>
            </article>
          );
        })}
        {state.connections.length === 0 && (
          <p className={styles.empty}>No providers</p>
        )}
      </div>
    </section>
  );
}

export default function AppShell() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [view, setView] = useState<View>("usage");
  const [refreshing, setRefreshing] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState<string>();
  const [addOpen, setAddOpen] = useState(false);
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setState(await refreshAll());
      setError(undefined);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleDiscover = useCallback(async () => {
    setDiscovering(true);
    try {
      setState(await discoverConnections());
      setError(undefined);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setDiscovering(false);
    }
  }, []);

  async function handleEnabledChange(id: string, enabled: boolean) {
    setBusyId(id);
    try {
      setState(await setConnectionEnabled(id, enabled));
      setError(undefined);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusyId(undefined);
    }
  }

  async function handleCaptureChange(id: string, install: boolean) {
    setBusyId(id);
    try {
      setState(await setClaudeCapture(id, install));
      setError(undefined);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusyId(undefined);
    }
  }

  async function handleLogin(id: string) {
    setBusyId(id);
    try {
      setState(await loginProviderAccount(id));
      setError(undefined);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusyId(undefined);
    }
  }

  async function handleAddProvider(
    provider: LoginProvider,
    profileName: string,
  ) {
    const nextState = await addProviderAccount(provider, profileName);
    setState(nextState);
    setView("providers");
    setError(undefined);
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

  return (
    <Tabs.Root
      className={styles.shell}
      onValueChange={(value) => value && setView(value as View)}
      value={view}
    >
      <header className={styles.header} data-tauri-drag-region>
        <div className={styles.brand}>
          <BrandMark size={28} />
          <strong>Devie QT</strong>
        </div>
        <div className={styles.headerActions}>
          <ThemeSwitcher />
          <Button
            aria-label="Refresh quotas"
            disabled={refreshing}
            onClick={() => void handleRefresh()}
            size="sm"
            variant="icon-primary"
          >
            <RefreshCw
              className={refreshing ? styles.spinning : undefined}
              size={15}
            />
          </Button>
        </div>
      </header>

      <Tabs.List className={styles.tabs}>
        <Tabs.Tab value="usage">Usage</Tabs.Tab>
        <Tabs.Tab value="providers">Providers</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <Button onClick={() => setError(undefined)} size="sm" variant="naked">
            Dismiss
          </Button>
        </div>
      )}

      <Tabs.Panel className={styles.panel} value="usage">
        <UsageView state={state} />
      </Tabs.Panel>
      <Tabs.Panel className={styles.panel} value="providers">
        <ProvidersView
          busyId={busyId}
          discovering={discovering}
          onAdd={() => setAddOpen(true)}
          onCaptureChange={(id, install) =>
            void handleCaptureChange(id, install)
          }
          onDiscover={() => void handleDiscover()}
          onEnabledChange={(id, enabled) =>
            void handleEnabledChange(id, enabled)
          }
          onLogin={(id) => void handleLogin(id)}
          state={state}
        />
      </Tabs.Panel>

      <AddProviderDialog
        onConnect={handleAddProvider}
        onOpenChange={setAddOpen}
        open={addOpen}
      />
    </Tabs.Root>
  );
}
