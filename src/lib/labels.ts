import type { Provider, ProviderConnection, QuotaWindow } from "./contracts";

export const PROVIDER_NAMES: Record<Provider, string> = {
  claude: "Claude Code",
  codex: "Codex",
  "gemini-cli": "Gemini CLI",
  antigravity: "Antigravity",
  copilot: "GitHub Copilot",
  cursor: "Cursor",
};

/** Providers without a documented quota API; their page shows a warning. */
const UNOFFICIAL_PROVIDERS: Provider[] = ["antigravity"];

export function isUnofficial(provider: Provider): boolean {
  return UNOFFICIAL_PROVIDERS.includes(provider);
}

export const PROVIDERS: Provider[] = [
  "claude",
  "codex",
  "gemini-cli",
  "antigravity",
  "copilot",
  "cursor",
];

/**
 * The line under the provider name: the user's own label, else the account
 * email or id, else the discovered label.
 */
export function accountLabel(connection: ProviderConnection): string {
  return (
    connection.customLabel ||
    connection.identity?.displayName ||
    connection.identity?.providerUserId ||
    connection.label
  );
}

/** The quota windows the user did not hide on this account's card. */
export function visibleWindows(connection: ProviderConnection): QuotaWindow[] {
  const hidden = connection.hiddenWindows ?? [];
  if (hidden.length === 0) return connection.windows;
  return connection.windows.filter((window) => !hidden.includes(window.key));
}

/** "Claude Code work@example.com" for menus and accessible names. */
export function fullName(connection: ProviderConnection): string {
  return `${PROVIDER_NAMES[connection.provider]} ${accountLabel(connection)}`;
}
