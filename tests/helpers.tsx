import { render } from "@testing-library/react";
import { createInstance } from "i18next";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import messages from "@/i18n/messages/en-US.json";
import type { ProviderConnection, QuotaWindow } from "@/lib/contracts";
import Tooltip from "@/ui/Tooltip";

export const testI18n = createInstance();
await testI18n.init({
  lng: "en-US",
  fallbackLng: "en-US",
  resources: { "en-US": { translation: messages } },
  interpolation: { escapeValue: false },
});

export function renderApp(element: ReactElement) {
  return render(element, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nextProvider i18n={testI18n}>
        <Tooltip.Provider>{children}</Tooltip.Provider>
      </I18nextProvider>
    ),
  });
}

export function quota(overrides: Partial<QuotaWindow> = {}): QuotaWindow {
  return { key: "session", label: "Session", usedPercent: 40, ...overrides };
}

export function account(overrides: Partial<ProviderConnection> = {}): ProviderConnection {
  return {
    id: "account-one",
    provider: "codex",
    label: "Personal",
    sourceLocator: "oauth/codex/test-account",
    enabled: true,
    status: "ready",
    source: "test",
    alerts: { lowQuota: false, resetSoon: false, resetHappened: false },
    autoPing: { enabled: false },
    windows: [quota()],
    ...overrides,
  };
}

export function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
