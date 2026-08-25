export type Provider = "claude" | "codex" | "copilot";
export type ConnectionStatus = "ready" | "stale" | "needs_login" | "error";
export type CaptureState = "available" | "installed" | "unsupported";

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

export interface ProviderConnection {
  id: string;
  provider: Provider;
  label: string;
  sourceLocator: string;
  enabled: boolean;
  status: ConnectionStatus;
  source: string;
  lastUpdatedAt?: string;
  lastError?: string;
  captureState?: CaptureState;
  identity?: RemoteIdentity;
  windows: QuotaWindow[];
}

export interface DashboardState {
  mode: "native" | "preview";
  connections: ProviderConnection[];
  databasePath?: string;
  refreshedAt?: string;
}
