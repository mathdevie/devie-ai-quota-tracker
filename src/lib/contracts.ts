export type Provider = "claude" | "codex" | "copilot";
export type ConnectionStatus = "ready" | "stale" | "needs_login" | "error";
/** `oauth`: the app holds tokens it obtained. `local`: a CLI on this Mac owns them. */
export type ConnectionKind = "oauth" | "local";

export interface QuotaWindow {
  key: string;
  label: string;
  usedPercent: number;
  resetsAt?: string;
}

export interface RemoteIdentity {
  providerUserId?: string;
  displayName?: string;
  plan?: string;
}

export interface ConnectionAlerts {
  lowQuota: boolean;
  resetSoon: boolean;
  resetHappened: boolean;
}

export interface AutoPingState {
  enabled: boolean;
  lastPingAt?: string;
  lastError?: string;
}

export interface ProviderConnection {
  id: string;
  provider: Provider;
  kind: ConnectionKind;
  label: string;
  sourceLocator: string;
  enabled: boolean;
  status: ConnectionStatus;
  source: string;
  lastUpdatedAt?: string;
  lastError?: string;
  /** A name the user typed for this account. */
  customLabel?: string;
  identity?: RemoteIdentity;
  alerts: ConnectionAlerts;
  autoPing: AutoPingState;
  windows: QuotaWindow[];
}

export interface AppSettings {
  showMenuBarItem: boolean;
}

export interface DashboardState {
  mode: "native" | "preview";
  connections: ProviderConnection[];
  databasePath?: string;
  refreshedAt?: string;
  settings: AppSettings;
}

export interface LoginStart {
  sessionId: string;
  provider: Provider;
  /** The page the browser opened. */
  url: string;
  /** Device flow only: the code to type on the provider page. */
  userCode?: string;
  /** True when the user can paste an authorization code by hand. */
  acceptsManualCode: boolean;
}
