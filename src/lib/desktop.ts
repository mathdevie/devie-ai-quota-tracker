import type { DashboardState, Provider } from "./contracts";
import { previewState } from "./fixtures";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isDesktop(): boolean {
  return typeof window !== "undefined" && Boolean(window.__TAURI_INTERNALS__);
}

export async function getDashboardState(): Promise<DashboardState> {
  if (!isDesktop()) return previewState;
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DashboardState>("get_dashboard_state");
}

export async function refreshAll(): Promise<DashboardState> {
  if (!isDesktop()) {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return previewState;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DashboardState>("refresh_all");
}

export async function discoverConnections(): Promise<DashboardState> {
  if (!isDesktop()) {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    return previewState;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DashboardState>("discover_connections");
}

export async function addProviderAccount(
  provider: Extract<Provider, "claude" | "codex">,
  profileName: string,
): Promise<DashboardState> {
  if (!isDesktop()) {
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    const label = provider === "claude" ? "Claude" : "Codex";
    return {
      ...previewState,
      connections: [
        ...previewState.connections,
        {
          id: `preview-${provider}-${profileName.toLowerCase().replaceAll(" ", "-")}`,
          provider,
          label: `${label} · ${profileName.trim()}`,
          sourceLocator: `local/${provider}/${profileName.trim()}`,
          enabled: true,
          status: "needs_login",
          source: "",
          lastError: "The browser preview cannot complete provider login.",
          captureState: provider === "claude" ? "available" : undefined,
          windows: [],
        },
      ],
    };
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DashboardState>("add_provider_account", {
    provider,
    profileName,
  });
}

export async function loginProviderAccount(
  connectionId: string,
): Promise<DashboardState> {
  if (!isDesktop()) {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return previewState;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DashboardState>("login_provider_account", { connectionId });
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
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DashboardState>("set_connection_enabled", {
    connectionId,
    enabled,
  });
}

export async function setClaudeCapture(
  connectionId: string,
  install: boolean,
): Promise<DashboardState> {
  if (!isDesktop()) return previewState;
  const { invoke } = await import("@tauri-apps/api/core");
  const command = install ? "install_claude_capture" : "remove_claude_capture";
  return invoke<DashboardState>(command, { connectionId });
}

export async function openMainWindow(): Promise<void> {
  if (!isDesktop()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("open_main_window");
}
