import type {
  CodexResetsStatus,
  ConnectionAlerts,
  DashboardState,
  LoginStart,
  Provider,
  ProviderConnection,
  TraySummary,
  UpdateChannel,
} from "./contracts";
import { previewCodexResets, previewState } from "./fixtures";

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

/** Shows a sample notification so the user can check the macOS permission. */
export async function sendTestNotification(
  connectionId: string,
): Promise<void> {
  if (!isDesktop()) return;
  await call("send_test_notification", { connectionId });
}

/** Saves the quota bars the user hid on one account card. */
export async function setHiddenWindows(
  connectionId: string,
  windowKeys: string[],
): Promise<DashboardState> {
  if (!isDesktop()) {
    return withConnection(connectionId, () => ({
      hiddenWindows: windowKeys.length > 0 ? windowKeys : undefined,
    }));
  }
  return call("set_hidden_windows", { connectionId, windowKeys });
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

/** Spends one Codex reset credit. The account quota is read again after. */
export async function spendResetCredit(
  connectionId: string,
  creditId: string,
): Promise<DashboardState> {
  if (!isDesktop()) {
    await delay(600);
    return withConnection(connectionId, (connection) => ({
      resetCredits: connection.resetCredits?.filter(
        (credit) => credit.id !== creditId,
      ),
      windows: connection.windows.map((window) => ({
        ...window,
        usedPercent: 0,
      })),
    }));
  }
  return call("use_reset_credit", { connectionId, creditId });
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
  const state = await call<"granted" | "denied" | "prompt">(
    "notification_permission_state",
  );
  if (state === "granted") return true;
  if (state === "denied") return false;
  return call<boolean>("request_notification_permission");
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

// The browser preview has no login item; a variable stands in for the OS.
let previewLaunchAtLogin = false;

/** Whether the app is registered to start when the user logs in. */
export async function getLaunchAtLogin(): Promise<boolean> {
  if (!isDesktop()) return previewLaunchAtLogin;
  return call("launch_at_login_enabled");
}

/** Registers or removes the app as a login item and returns the new state. */
export async function setLaunchAtLogin(enabled: boolean): Promise<boolean> {
  if (!isDesktop()) {
    previewLaunchAtLogin = enabled;
    return enabled;
  }
  return call("set_launch_at_login", { enabled });
}

/** Picks which release channel updates come from. */
export async function setUpdateChannel(
  channel: UpdateChannel,
): Promise<DashboardState> {
  if (!isDesktop()) {
    return {
      ...previewState,
      settings: { ...previewState.settings, updateChannel: channel },
    };
  }
  return call("set_update_channel", { channel });
}

/** Turns anonymous usage events and crash reports on or off. */
export async function setTelemetryEnabled(
  enabled: boolean,
): Promise<DashboardState> {
  if (!isDesktop()) {
    return {
      ...previewState,
      settings: { ...previewState.settings, telemetryEnabled: enabled },
    };
  }
  return call("set_telemetry_enabled", { enabled });
}

/** Tells the Rust side which language to use for the tray menu and alerts. */
export async function setLanguage(locale: string): Promise<void> {
  if (!isDesktop()) return;
  await call("set_language", { locale });
}

/** The community reset news from codex-resets.com, cached by the core. */
export async function getCodexResetsStatus(): Promise<CodexResetsStatus> {
  if (!isDesktop()) {
    await delay(300);
    return { ...previewCodexResets, fetchedAt: new Date().toISOString() };
  }
  return call("get_codex_resets_status");
}

/**
 * Calls `handler` with the reset news the core fetched after a manual
 * refresh, in every window. Returns a function that stops listening.
 */
export function onCodexResetsStatus(
  handler: (status: CodexResetsStatus) => void,
): () => void {
  if (!isDesktop()) return () => {};
  let cancelled = false;
  let stop: (() => void) | undefined;
  void import("@tauri-apps/api/event").then(({ listen }) =>
    listen<CodexResetsStatus>("codex-resets:updated", (event) =>
      handler(event.payload),
    ).then((unlisten) => {
      if (cancelled) void unlisten();
      else stop = unlisten;
    }),
  );
  return () => {
    cancelled = true;
    stop?.();
  };
}

/** Opens a web link in the default browser. */
export async function openExternalUrl(url: string): Promise<void> {
  if (!isDesktop()) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  await call("open_external_url", { url });
}

export async function openMainWindow(): Promise<void> {
  if (!isDesktop()) return;
  await call("open_main_window");
}

export async function hidePopover(): Promise<void> {
  if (!isDesktop()) return;
  await call("hide_popover");
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
