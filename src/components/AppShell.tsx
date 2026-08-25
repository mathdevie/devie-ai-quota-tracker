"use client";

import {
  Activity,
  ArrowUpRight,
  Check,
  Database,
  Eye,
  Gauge,
  LayoutGrid,
  ListFilter,
  LoaderCircle,
  MonitorUp,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DashboardState, ProviderConnection } from "@/lib/contracts";
import {
  discoverConnections,
  getDashboardState,
  isDesktop,
  openMainWindow,
  refreshAll,
  setClaudeCapture,
  setConnectionEnabled,
} from "@/lib/desktop";
import Button from "@/ui/Button";
import Callout from "@/ui/Callout";
import Switch from "@/ui/Switch";
import styles from "./AppShell.module.scss";
import BrandMark from "./BrandMark";
import ConnectionCard from "./ConnectionCard";

type View = "overview" | "connections" | "settings";

function remainingPercent(connection: ProviderConnection): number {
  if (connection.windows.length === 0) return 100;
  return Math.max(
    0,
    100 - Math.max(...connection.windows.map((window) => window.usedPercent)),
  );
}

function latestUpdate(state: DashboardState | null): string {
  if (!state?.refreshedAt) return "Not refreshed";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(state.refreshedAt));
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
  const lowest = Math.min(...enabled.map(remainingPercent), 100);

  return (
    <main className={styles.popover}>
      <header className={styles.popoverHeader} data-tauri-drag-region>
        <div className={styles.brand}>
          <BrandMark size={30} />
          <div>
            <strong>Devie QT</strong>
            <span>{lowest}% minimum remaining</span>
          </div>
        </div>
        <Button
          aria-label="Refresh all quotas"
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
      </header>

      <section className={styles.popoverList}>
        {enabled.map((connection) => (
          <ConnectionCard compact connection={connection} key={connection.id} />
        ))}
      </section>

      <footer className={styles.popoverFooter}>
        <span>Updated {latestUpdate(state)}</span>
        <Button onClick={() => void openMainWindow()} size="sm" variant="naked">
          Open dashboard <ArrowUpRight size={14} />
        </Button>
      </footer>
    </main>
  );
}

function Overview({ state }: { state: DashboardState }) {
  const enabled = state.connections.filter((connection) => connection.enabled);
  const healthy = enabled.filter(
    (connection) => connection.status === "ready",
  ).length;
  const lowest = Math.min(...enabled.map(remainingPercent), 100);
  const providers = new Set(enabled.map((connection) => connection.provider))
    .size;

  return (
    <>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            <Sparkles size={14} /> Local quota overview
          </span>
          <h1>Your AI limits, in one place.</h1>
          <p>
            Each CLI profile stays separate. Your account data stays on this
            Mac.
          </p>
        </div>
        <div className={styles.heroGauge}>
          <Gauge aria-hidden size={22} />
          <strong>{lowest}%</strong>
          <span>minimum remaining</span>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <span>Connections</span>
          <strong>{enabled.length}</strong>
          <small>{providers} providers</small>
        </div>
        <div className={styles.stat}>
          <span>Healthy now</span>
          <strong>{healthy}</strong>
          <small>{enabled.length - healthy} need attention</small>
        </div>
        <div className={styles.stat}>
          <span>Last refresh</span>
          <strong>{latestUpdate(state)}</strong>
          <small>Local device time</small>
        </div>
      </section>

      {state.mode === "preview" && (
        <Callout.Root variant="primary">
          <Callout.Icon>
            <Eye />
          </Callout.Icon>
          <Callout.Content title="Browser preview">
            The desktop app replaces this sample data with local provider
            records.
          </Callout.Content>
        </Callout.Root>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Subscription limits</h2>
            <p>
              The app keeps every provider profile as a separate connection.
            </p>
          </div>
          <span className={styles.liveLabel}>
            <i /> {healthy} live
          </span>
        </div>
        <div className={styles.cardGrid}>
          {enabled.map((connection) => (
            <ConnectionCard connection={connection} key={connection.id} />
          ))}
        </div>
      </section>
    </>
  );
}

function ConnectionsView({
  state,
  busyId,
  onEnabledChange,
  onCaptureChange,
}: {
  state: DashboardState;
  busyId?: string;
  onEnabledChange: (id: string, enabled: boolean) => void;
  onCaptureChange: (id: string, install: boolean) => void;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.pageHeading}>
        <div>
          <span className={styles.eyebrow}>Provider profiles</span>
          <h1>Connections</h1>
          <p>
            The app finds local CLI profiles. It never combines their quota.
          </p>
        </div>
      </div>
      <div className={styles.connectionRows}>
        {state.connections.map((connection) => (
          <article className={styles.connectionRow} key={connection.id}>
            <div className={styles.connectionMain}>
              <span
                className={styles.connectionGlyph}
                data-provider={connection.provider}
              >
                {connection.provider.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <h3>{connection.label}</h3>
                <code>{connection.sourceLocator}</code>
              </div>
            </div>
            <div className={styles.connectionTools}>
              {connection.provider === "claude" && (
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
                    : "Add capture"}
                </Button>
              )}
              <div className={styles.switchLabel}>
                <span>{connection.enabled ? "Enabled" : "Disabled"}</span>
                <Switch.Root
                  checked={connection.enabled}
                  disabled={busyId === connection.id}
                  onCheckedChange={(checked) =>
                    onEnabledChange(connection.id, checked)
                  }
                >
                  <Switch.Thumb />
                </Switch.Root>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsView({ state }: { state: DashboardState }) {
  return (
    <section className={styles.section}>
      <div className={styles.pageHeading}>
        <div>
          <span className={styles.eyebrow}>Local by design</span>
          <h1>Settings</h1>
          <p>
            The POC uses your installed provider tools and their local sessions.
          </p>
        </div>
      </div>

      <div className={styles.settingsGrid}>
        <article className={styles.settingCard}>
          <Database aria-hidden />
          <div>
            <h3>Local database</h3>
            <p>Quota history and connection labels use SQLite.</p>
            <code>
              {state.databasePath ?? "The database opens in the desktop app."}
            </code>
          </div>
          <Check className={styles.settingCheck} size={18} />
        </article>
        <article className={styles.settingCard}>
          <ShieldCheck aria-hidden />
          <div>
            <h3>Credential safety</h3>
            <p>
              The webview, database, and logs never receive provider tokens.
            </p>
          </div>
          <Check className={styles.settingCheck} size={18} />
        </article>
        <article className={styles.settingCard}>
          <MonitorUp aria-hidden />
          <div>
            <h3>Menu bar</h3>
            <p>
              The tray text shows the lowest remaining limit across enabled
              profiles.
            </p>
          </div>
          <Check className={styles.settingCheck} size={18} />
        </article>
      </div>

      <Callout.Root variant="sub">
        <Callout.Icon>
          <Activity />
        </Callout.Icon>
        <Callout.Content title="POC scope">
          Token and cost statistics remain outside this first quota POC.
        </Callout.Content>
      </Callout.Root>
    </section>
  );
}

export default function AppShell() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [view, setView] = useState<View>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState<string>();
  const [surface, setSurface] = useState<"main" | "popover">("main");

  const load = useCallback(async () => {
    try {
      setState(await getDashboardState());
      setError(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
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
      setError(reason instanceof Error ? reason.message : String(reason));
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
      setError(reason instanceof Error ? reason.message : String(reason));
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
      setError(reason instanceof Error ? reason.message : String(reason));
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
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusyId(undefined);
    }
  }

  if (!state) {
    return (
      <main className={styles.loading}>
        <BrandMark size={42} />
        <LoaderCircle className={styles.spinning} />
        <span>Loading local quota data…</span>
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

  let viewContent = <Overview state={state} />;
  if (view === "connections") {
    viewContent = (
      <ConnectionsView
        busyId={busyId}
        onCaptureChange={(id, install) => void handleCaptureChange(id, install)}
        onEnabledChange={(id, enabled) => void handleEnabledChange(id, enabled)}
        state={state}
      />
    );
  } else if (view === "settings") {
    viewContent = <SettingsView state={state} />;
  }

  const navItems: Array<{ id: View; label: string; icon: typeof LayoutGrid }> =
    [
      { id: "overview", label: "Overview", icon: LayoutGrid },
      { id: "connections", label: "Connections", icon: ListFilter },
      { id: "settings", label: "Settings", icon: Settings },
    ];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <BrandMark />
          <div>
            <strong>Devie QT</strong>
            <span>Quota tracker</span>
          </div>
        </div>
        <nav aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                aria-current={view === item.id ? "page" : undefined}
                key={item.id}
                onClick={() => setView(item.id)}
                type="button"
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className={styles.sidebarNote}>
          <ShieldCheck size={17} />
          <div>
            <strong>Private by default</strong>
            <span>No account. No cloud sync.</span>
          </div>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.toolbar} data-tauri-drag-region>
          <div>
            <span className={styles.statusDot} />
            Local service ready
          </div>
          <div className={styles.actions}>
            <Button
              disabled={discovering}
              onClick={() => void handleDiscover()}
              size="sm"
              variant="secondary"
            >
              <ListFilter size={14} />
              {discovering ? "Scanning…" : "Find profiles"}
            </Button>
            <Button
              disabled={refreshing}
              onClick={() => void handleRefresh()}
              size="sm"
            >
              <RefreshCw
                className={refreshing ? styles.spinning : undefined}
                size={14}
              />
              {refreshing ? "Refreshing…" : "Refresh all"}
            </Button>
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => setError(undefined)} type="button">
              Dismiss
            </button>
          </div>
        )}

        <main className={styles.content}>{viewContent}</main>
      </div>
    </div>
  );
}
