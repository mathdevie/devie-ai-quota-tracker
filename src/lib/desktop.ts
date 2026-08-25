import type {
  AppSettings,
  DashboardState,
  LoginStart,
  Provider,
} from "./contracts";
import { previewState } from "./fixtures";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isDesktop(): boolean {
  return typeof window !== "undefined" && Boolean(window.__TAURI_INTERNALS__);
}

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

export async function setClaudeCapture(
  connectionId: string,
  install: boolean,
): Promise<DashboardState> {
  if (!isDesktop()) return previewState;
  const command = install ? "install_claude_capture" : "remove_claude_capture";
  return call(command, { connectionId });
}

export async function getAppSettings(): Promise<AppSettings | undefined> {
  if (!isDesktop()) return undefined;
  return call("get_app_settings");
}

export async function setTranslucency(enabled: boolean): Promise<void> {
  if (!isDesktop()) return;
  await call("set_translucency", { enabled });
}

export async function openMainWindow(): Promise<void> {
  if (!isDesktop()) return;
  await call("open_main_window");
}
