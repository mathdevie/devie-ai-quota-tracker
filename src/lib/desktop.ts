import type {
  ConnectionAlerts,
  DashboardState,
  LoginStart,
  Provider,
  ProviderConnection,
  TraySummary,
} from "./contracts";
import type { Filters } from "./filters";
import { previewState } from "./fixtures";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isDesktop(): boolean {
  return typeof window !== "undefined" && Boolean(window.__TAURI_INTERNALS__);
}

/**
 * True only for packaged builds (`tauri build`). `tauri dev` must not read
 * the production update feed or install over the development binary.
 */
export const IS_DESKTOP_BUILD =
  process.env.NEXT_PUBLIC_IS_DESKTOP_BUILD === "true";

async function call<T>(command: string, args?: Record<string, unknown>) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function getDashboardState(): Promise<DashboardState> {
  if (!isDesktop()) return previewState;
  return call("get_dashboard_state");
}

export async function refreshAll(): Promise<DashboardState> {
  if (!isDesktop()) {
    await delay(450);
    return previewState;
  }
  return call("refresh_all");
}

export async function refreshConnection(
  connectionId: string,
): Promise<DashboardState> {
  if (!isDesktop()) {
    await delay(300);
    return previewState;
  }
  return call("refresh_connection", { connectionId });
}

export async function discoverConnections(): Promise<DashboardState> {
  if (!isDesktop()) {
    await delay(350);
    return previewState;
  }
  return call("discover_connections");
}

export async function startLogin(provider: Provider): Promise<LoginStart> {
  if (!isDesktop()) {
    await delay(300);
    return {
      sessionId: "preview",
      provider,
      url: "https://example.com/oauth",
      userCode: provider === "copilot" ? "ABCD-1234" : undefined,
      acceptsManualCode: provider === "claude",
    };
  }
  return call("start_login", { provider });
}

export async function finishLogin(
  sessionId: string,
  code?: string,
): Promise<DashboardState> {
  if (!isDesktop()) {
    await delay(1200);
    throw new Error("The browser preview cannot complete a provider sign-in.");
  }
  return call("finish_login", { sessionId, code: code || null });
}

export async function cancelLogin(sessionId: string): Promise<void> {
  if (!isDesktop()) return;
  await call("cancel_login", { sessionId });
}

export async function removeConnection(
  connectionId: string,
): Promise<DashboardState> {
  if (!isDesktop()) {
    return {
      ...previewState,
      connections: previewState.connections.filter(
        (connection) => connection.id !== connectionId,
      ),
    };
  }
  return call("remove_connection", { connectionId });
}

export async function setConnectionEnabled(
  connectionId: string,
  enabled: boolean,
): Promise<DashboardState> {
  if (!isDesktop()) {
    return {
      ...previewState,
      connections: previewState.connections.map((connection) =>
        connection.id === connectionId
          ? { ...connection, enabled }
          : connection,
      ),
    };
  }
  return call("set_connection_enabled", { connectionId, enabled });
}

export async function renameConnection(
  connectionId: string,
  label: string,
): Promise<DashboardState> {
  const trimmed = label.trim();
  if (!isDesktop()) {
    return {
      ...previewState,
      connections: previewState.connections.map((connection) =>
        connection.id === connectionId
          ? { ...connection, customLabel: trimmed || undefined }
          : connection,
      ),
    };
  }
  return call("rename_connection", { connectionId, label: trimmed || null });
}

function withConnection(
  connectionId: string,
  patch: (connection: ProviderConnection) => Partial<ProviderConnection>,
): DashboardState {
  return {
    ...previewState,
    connections: previewState.connections.map((connection) =>
      connection.id === connectionId
        ? { ...connection, ...patch(connection) }
        : connection,
    ),
  };
}

export async function setConnectionAlerts(
  connectionId: string,
  alerts: ConnectionAlerts,
): Promise<DashboardState> {
  if (!isDesktop()) return withConnection(connectionId, () => ({ alerts }));
  return call("set_connection_alerts", { connectionId, alerts });
}

export async function setAutoPing(
  connectionId: string,
  enabled: boolean,
): Promise<DashboardState> {
  if (!isDesktop()) {
    return withConnection(connectionId, (connection) => ({
      autoPing: { ...connection.autoPing, enabled },
    }));
  }
  return call("set_auto_ping", { connectionId, enabled });
}

export async function setTraySummary(
  summary: TraySummary | null,
): Promise<DashboardState> {
  if (!isDesktop()) {
    return {
      ...previewState,
      settings: { ...previewState.settings, traySummary: summary ?? undefined },
    };
  }
  return call("set_tray_summary", { summary });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isDesktop()) return true;
  const { isPermissionGranted, requestPermission } = await import(
    "@tauri-apps/plugin-notification"
  );
  if (await isPermissionGranted()) return true;
  return (await requestPermission()) === "granted";
}

export async function setMenuBarItemVisible(
  visible: boolean,
): Promise<DashboardState> {
  if (!isDesktop()) {
    return {
      ...previewState,
      settings: { ...previewState.settings, showMenuBarItem: visible },
    };
  }
  return call("set_menu_bar_item_visible", { visible });
}

export async function openMainWindow(): Promise<void> {
  if (!isDesktop()) return;
  await call("open_main_window");
}

/** Tells the other window (main or popover) that the filters changed. */
export async function broadcastFilters(filters: Filters): Promise<void> {
  if (!isDesktop()) return;
  const { emit } = await import("@tauri-apps/api/event");
  await emit("quota:filters", filters);
}

export async function listenFilters(
  onChange: (filters: Filters) => void,
): Promise<() => void> {
  if (!isDesktop()) return () => {};
  const { listen } = await import("@tauri-apps/api/event");
  return listen<Filters>("quota:filters", (event) => onChange(event.payload));
}

/** Fits the popover window to its content. The width stays as it is. */
export async function resizePopover(height: number): Promise<void> {
  if (!isDesktop()) return;
  const { getCurrentWindow, LogicalSize } = await import(
    "@tauri-apps/api/window"
  );
  await getCurrentWindow().setSize(
    new LogicalSize(window.innerWidth, Math.round(height)),
  );
}
