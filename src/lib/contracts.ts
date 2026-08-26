export type Provider = "claude" | "codex" | "gemini-cli" | "copilot";
export type ConnectionStatus = "ready" | "stale" | "needs_login" | "error";

export interface QuotaWindow {
  key: string;
  label: string;
  usedPercent: number;
  resetsAt?: string;
  /** True when the provider sets no cap. `usedPercent` is 0. */
  unlimited?: boolean;
  /** The absolute count behind the percent, when the provider gives one. */
  amount?: QuotaAmount;
  /** A paid allowance past the plan: extra usage, credits. Never drives the menu bar. */
  paid?: boolean;
}

/** "677 of 1,500 credits, plus 12 over the cap". */
export interface QuotaAmount {
  /** Absent for a balance the provider only reports as "left". */
  used?: number;
  total: number;
  /** A short unit name ("credits") or an ISO currency code ("USD"). */
  unit?: string;
  /** Usage past the cap, billed extra. Absent when the provider allows none. */
  overage?: number;
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
  /** Codex only: banked reset credits the user can spend. */
  resetCredits?: ResetCredit[];
}

/** One Codex reset credit. Spending it resets every window of the account. */
export interface ResetCredit {
  id: string;
  title?: string;
  grantedAt?: string;
  expiresAt?: string;
}

/** The quota window the menu bar item shows: one provider logo, one percent. */
export interface TraySummary {
  connectionId: string;
  windowKey: string;
}

export interface AppSettings {
  showMenuBarItem: boolean;
  /** Absent: the menu bar shows the window with the least quota left. */
  traySummary?: TraySummary;
}

export interface DashboardState {
  mode: "native" | "preview";
  connections: ProviderConnection[];
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
