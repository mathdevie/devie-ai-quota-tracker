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
import type { Filters } from "./filters";
import { previewCodexResets, previewState } from "./fixtures";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

/**
 * Where the page runs. `native`: a Tauri window. `remote`: a browser that
 * loaded the page from the app's HTTP server. `preview`: `bun run dev` or
 * a plain static export, with local fixtures.
 */
export type Mode = "native" | "remote" | "preview";

let mode: Mode = "preview";
let detection: Promise<Mode> | undefined;

const REMOTE_TOKEN_KEY = "devie-quota-remote-token:v1";

export function isDesktop(): boolean {
  return typeof window !== "undefined" && Boolean(window.__TAURI_INTERNALS__);
}

/** The mode found by `detectMode`. `preview` until detection ran. */
export function currentMode(): Mode {
  return mode;
}

/**
 * Finds the mode once. A remote page answers `/api/state` with data or with
 * `401`; a preview server answers with a 404 page or not at all.
 */
export function detectMode(): Promise<Mode> {
  if (!detection) detection = detect();
  return detection;
}

async function detect(): Promise<Mode> {
  if (isDesktop()) {
    mode = "native";
    return mode;
  }
  adoptTokenFromUrl();
  try {
    const response = await fetch("/api/state", {
      headers: remoteHeaders(),
      cache: "no-store",
    });
    if (response.ok || response.status === 401) mode = "remote";
  } catch {
    // No server behind the page: the preview fixtures apply.
  }
  return mode;
}

/** The copied link carries the token in the fragment: `#token=…`. */
function adoptTokenFromUrl() {
  const match = /(?:^#|&)token=([A-Za-z0-9]+)/.exec(window.location.hash);
  if (!match) return;
  setRemoteToken(match[1]);
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
}

export function setRemoteToken(token: string) {
  try {
    window.localStorage.setItem(REMOTE_TOKEN_KEY, token.trim());
  } catch {
    // Private browsing without storage: the token lives for this page only.
    memoryToken = token.trim();
  }
}

let memoryToken: string | undefined;

function remoteToken(): string | undefined {
  try {
    return window.localStorage.getItem(REMOTE_TOKEN_KEY) ?? memoryToken;
  } catch {
    return memoryToken;
  }
}

function remoteHeaders(): HeadersInit {
  const token = remoteToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** The server refused the token. The page must ask for a new one. */
export class RemoteAuthError extends Error {
  constructor() {
    super("The access token is wrong.");
    this.name = "RemoteAuthError";
  }
}

async function remote<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { ...remoteHeaders(), ...init?.headers },
    cache: "no-store",
  });
  if (response.status === 401) throw new RemoteAuthError();
  if (!response.ok) {
    let message: string | undefined;
    try {
      message = ((await response.json()) as { error?: string }).error;
    } catch {
      // A plain-text or empty body: the status is the message.
    }
    throw new Error(message ?? `The server answered with ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

/** Actions a remote page never runs. The interface hides them as well. */
function readOnly(): never {
  throw new Error("The remote dashboard is read-only. Use the app on the Mac.");
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
  if (mode === "remote") return remote("/api/state");
  if (!isDesktop()) return previewState;
  return call("get_dashboard_state");
}

export async function refreshAll(): Promise<DashboardState> {
  if (mode === "remote") return remote("/api/refresh", { method: "POST" });
  if (!isDesktop()) {
    await delay(450);
    return previewState;
  }
  return call("refresh_all");
}

export async function refreshConnection(
  connectionId: string,
): Promise<DashboardState> {
  if (mode === "remote") {
    return remote(`/api/refresh/${encodeURIComponent(connectionId)}`, {
      method: "POST",
    });
  }
  if (!isDesktop()) {
    await delay(300);
    return previewState;
  }
  return call("refresh_connection", { connectionId });
}

export async function startLogin(provider: Provider): Promise<LoginStart> {
  if (mode === "remote") readOnly();
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
  if (mode === "remote") readOnly();
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
  if (mode === "remote") readOnly();
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
  if (mode === "remote") readOnly();
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
  if (mode === "remote") readOnly();
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
  if (mode === "remote") readOnly();
  if (!isDesktop()) return withConnection(connectionId, () => ({ alerts }));
  return call("set_connection_alerts", { connectionId, alerts });
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
  if (mode === "remote") readOnly();
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
  if (mode === "remote") readOnly();
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
  if (mode === "remote") readOnly();
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
  if (mode === "remote") readOnly();
  if (!isDesktop()) {
    return {
      ...previewState,
      settings: { ...previewState.settings, showMenuBarItem: visible },
    };
  }
  return call("set_menu_bar_item_visible", { visible });
}

/** Starts, changes, or stops the HTTP server that serves the dashboard. */
export async function setRemoteAccess(options: {
  enabled: boolean;
  port: number;
  lan: boolean;
}): Promise<DashboardState> {
  if (mode === "remote") readOnly();
  if (!isDesktop()) {
    await delay(300);
    const remoteAccess = {
      ...previewState.settings.remoteAccess,
      ...options,
      urls: options.enabled ? [`http://localhost:${options.port}`] : [],
    };
    return {
      ...previewState,
      settings: { ...previewState.settings, remoteAccess },
    };
  }
  return call("set_remote_access", options);
}

/** Replaces the remote access token. Every remote page must sign in again. */
export async function regenerateRemoteToken(): Promise<DashboardState> {
  if (mode === "remote") readOnly();
  if (!isDesktop()) {
    await delay(300);
    return previewState;
  }
  return call("regenerate_remote_token");
}

/** Picks which release channel updates come from. */
export async function setUpdateChannel(
  channel: UpdateChannel,
): Promise<DashboardState> {
  if (mode === "remote") readOnly();
  if (!isDesktop()) {
    return {
      ...previewState,
      settings: { ...previewState.settings, updateChannel: channel },
    };
  }
  return call("set_update_channel", { channel });
}

/** Tells the Rust side which language to use for the tray menu and alerts. */
export async function setLanguage(locale: string): Promise<void> {
  if (!isDesktop()) return;
  await call("set_language", { locale });
}

/** The community reset news from codex-resets.com, cached by the core. */
export async function getCodexResetsStatus(): Promise<CodexResetsStatus> {
  if (mode === "remote") return remote("/api/codex-resets");
  if (!isDesktop()) {
    await delay(300);
    return previewCodexResets;
  }
  return call("get_codex_resets_status");
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
