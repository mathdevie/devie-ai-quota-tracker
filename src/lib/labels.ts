import type { Provider, ProviderConnection } from "./contracts";

export const PROVIDER_NAMES: Record<Provider, string> = {
  claude: "Claude Code",
  codex: "Codex",
  copilot: "GitHub Copilot",
};

export const PROVIDERS: Provider[] = ["claude", "codex", "copilot"];

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

/** "Claude Code · work@example.com" for menus and accessible names. */
export function fullName(connection: ProviderConnection): string {
  return `${PROVIDER_NAMES[connection.provider]} · ${accountLabel(connection)}`;
}
