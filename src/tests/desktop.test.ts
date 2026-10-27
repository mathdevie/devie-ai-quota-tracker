import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import * as desktop from "@/features/desktop/desktop";
import { previewCodexResets, previewState } from "@/features/desktop/fixtures";
import type { CodexResetsStatus, DashboardState } from "@/features/desktop/contracts";
import { deferred } from "./helpers";

const native = vi.hoisted(() => ({ invoke: vi.fn(), listen: vi.fn(), setSize: vi.fn() }));
vi.mock("@tauri-apps/api/core", () => ({ invoke: native.invoke }));
vi.mock("@tauri-apps/api/event", () => ({ listen: native.listen }));
vi.mock("@tauri-apps/api/window", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tauri-apps/api/window")>()),
  getCurrentWindow: () => ({ setSize: native.setSize }),
}));

beforeEach(() => {
  native.invoke.mockReset().mockResolvedValue(previewState);
  native.listen.mockReset().mockResolvedValue(vi.fn());
  native.setSize.mockReset().mockResolvedValue(undefined);
});

const alerts = { lowQuota: true, resetSoon: false, resetHappened: true };
const summary = { connectionId: "account", windowKey: "weekly" };
const commands: [string, () => Promise<unknown>, Record<string, unknown> | undefined][] = [
  ["get_dashboard_state", () => desktop.getDashboardState(), undefined],
  ["refresh_all", () => desktop.refreshAll(), undefined],
  ["refresh_connection", () => desktop.refreshConnection("account"), { connectionId: "account" }],
  ["start_login", () => desktop.startLogin("claude"), { provider: "claude" }],
  [
    "submit_login_code",
    () => desktop.submitLoginCode("session", "code"),
    { sessionId: "session", code: "code" },
  ],
  ["finish_login", () => desktop.finishLogin("session"), { sessionId: "session" }],
  ["cancel_login", () => desktop.cancelLogin("session"), { sessionId: "session" }],
  ["remove_connection", () => desktop.removeConnection("account"), { connectionId: "account" }],
  [
    "set_connection_enabled",
    () => desktop.setConnectionEnabled("account", false),
    { connectionId: "account", enabled: false },
  ],
  [
    "rename_connection",
    () => desktop.renameConnection("account", "  Work  "),
    { connectionId: "account", label: "Work" },
  ],
  [
    "rename_connection",
    () => desktop.renameConnection("account", "  "),
    { connectionId: "account", label: null },
  ],
  [
    "set_connection_alerts",
    () => desktop.setConnectionAlerts("account", alerts),
    { connectionId: "account", alerts },
  ],
  [
    "send_test_notification",
    () => desktop.sendTestNotification("account"),
    { connectionId: "account" },
  ],
  [
    "set_hidden_windows",
    () => desktop.setHiddenWindows("account", ["weekly"]),
    { connectionId: "account", windowKeys: ["weekly"] },
  ],
  [
    "set_auto_ping",
    () => desktop.setAutoPing("account", true),
    { connectionId: "account", enabled: true },
  ],
  [
    "use_reset_credit",
    () => desktop.spendResetCredit("account", "credit"),
    { connectionId: "account", creditId: "credit" },
  ],
  ["set_tray_summary", () => desktop.setTraySummary(summary), { summary }],
  ["set_tray_summary", () => desktop.setTraySummary(null), { summary: null }],
  ["set_menu_bar_item_visible", () => desktop.setMenuBarItemVisible(false), { visible: false }],
  ["launch_at_login_enabled", () => desktop.getLaunchAtLogin(), undefined],
  ["set_launch_at_login", () => desktop.setLaunchAtLogin(true), { enabled: true }],
  ["set_update_channel", () => desktop.setUpdateChannel("nightly"), { channel: "nightly" }],
  ["set_telemetry_enabled", () => desktop.setTelemetryEnabled(false), { enabled: false }],
  ["set_language", () => desktop.setLanguage("fr-FR"), { locale: "fr-FR" }],
  ["get_codex_resets_status", () => desktop.getCodexResetsStatus(), undefined],
  [
    "open_external_url",
    () => desktop.openExternalUrl("https://example.test/"),
    { url: "https://example.test/" },
  ],
  ["open_main_window", () => desktop.openMainWindow(), undefined],
  ["hide_popover", () => desktop.hidePopover(), undefined],
];

describe("native bridge", () => {
  beforeEach(() => {
    window.__TAURI_INTERNALS__ = {};
  });

  test.each(commands)(
    "dispatches %s with the expected argument names",
    async (command, execute, args) => {
      await execute();
      expect(native.invoke).toHaveBeenCalledExactlyOnceWith(command, args);
    },
  );

  test("returns the normalized native response unchanged and propagates failures", async () => {
    const response: DashboardState = { ...previewState, mode: "native" };
    native.invoke.mockResolvedValueOnce(response);
    expect(await desktop.getDashboardState()).toBe(response);
    const failure = new Error("Sign in again");
    native.invoke.mockRejectedValueOnce(failure);
    await expect(desktop.refreshConnection("account")).rejects.toBe(failure);
  });

  test.each([
    ["granted", true],
    ["denied", false],
  ] as const)("does not re-prompt when notifications are %s", async (state, expected) => {
    native.invoke.mockResolvedValueOnce(state);
    expect(await desktop.ensureNotificationPermission()).toBe(expected);
    expect(native.invoke).toHaveBeenCalledExactlyOnceWith(
      "notification_permission_state",
      undefined,
    );
  });

  test.each([true, false])(
    "requests notification permission when undecided (result=%s)",
    async (granted) => {
      native.invoke.mockResolvedValueOnce("prompt").mockResolvedValueOnce(granted);
      expect(await desktop.ensureNotificationPermission()).toBe(granted);
      expect(native.invoke.mock.calls).toEqual([
        ["notification_permission_state", undefined],
        ["request_notification_permission", undefined],
      ]);
    },
  );

  test("rounds popover height and keeps its current logical width", async () => {
    vi.stubGlobal("innerWidth", 350);
    await desktop.resizePopover(322.6);
    expect(native.setSize).toHaveBeenCalledWith(
      expect.objectContaining({ width: 350, height: 323, type: "Logical" }),
    );
  });

  test("forwards reset-news payloads and unregisters when disposed", async () => {
    const unlisten = vi.fn();
    native.listen.mockResolvedValueOnce(unlisten);
    const handler = vi.fn();
    const stop = desktop.onCodexResetsStatus(handler);
    await vi.waitFor(() =>
      expect(native.listen).toHaveBeenCalledWith("codex-resets:updated", expect.any(Function)),
    );
    const callback = native.listen.mock.calls[0][1] as (event: {
      payload: CodexResetsStatus;
    }) => void;
    callback({ payload: previewCodexResets });
    expect(handler).toHaveBeenCalledExactlyOnceWith(previewCodexResets);
    stop();
    expect(unlisten).toHaveBeenCalledTimes(1);
  });

  test("unregisters even if disposal precedes async listener registration", async () => {
    const pending = deferred<() => void>();
    native.listen.mockReturnValueOnce(pending.promise);
    const stop = desktop.onCodexResetsStatus(vi.fn());
    stop();
    await vi.waitFor(() => expect(native.listen).toHaveBeenCalledTimes(1));
    const unlisten = vi.fn();
    pending.resolve(unlisten);
    await vi.waitFor(() => expect(unlisten).toHaveBeenCalledTimes(1));
  });
});

describe("browser preview isolation", () => {
  test("detects no desktop without a window or Tauri marker", () => {
    expect(desktop.isDesktop()).toBe(false);
    vi.stubGlobal("window", undefined);
    expect(desktop.isDesktop()).toBe(false);
  });

  test("refreshes fixture data without a native call", async () => {
    vi.useFakeTimers();
    const all = desktop.refreshAll();
    const one = desktop.refreshConnection("account");
    await vi.runAllTimersAsync();
    expect(await all).toBe(previewState);
    expect(await one).toBe(previewState);
    expect(await desktop.getDashboardState()).toBe(previewState);
    expect(native.invoke).not.toHaveBeenCalled();
  });

  test.each(["claude", "copilot", "codex"] as const)(
    "preview %s login does not authenticate",
    async (provider) => {
      vi.useFakeTimers();
      const start = desktop.startLogin(provider);
      await vi.runAllTimersAsync();
      expect(await start).toEqual({
        sessionId: "preview",
        provider,
        url: "https://example.com/oauth",
        userCode: provider === "copilot" ? "ABCD-1234" : undefined,
        acceptsManualCode: provider === "claude",
      });
      const finish = expect(desktop.finishLogin("preview")).rejects.toThrow(
        "browser preview cannot complete",
      );
      await vi.runAllTimersAsync();
      await finish;
      expect(native.invoke).not.toHaveBeenCalled();
    },
  );

  test("account changes affect only the target and never mutate fixtures", async () => {
    const original = structuredClone(previewState);
    const connectionId = previewState.connections[0].id;
    const operations: [() => Promise<DashboardState>, object][] = [
      [() => desktop.setConnectionEnabled(connectionId, false), { enabled: false }],
      [() => desktop.renameConnection(connectionId, "  Work  "), { customLabel: "Work" }],
      [() => desktop.renameConnection(connectionId, "  "), { customLabel: undefined }],
      [() => desktop.setConnectionAlerts(connectionId, alerts), { alerts }],
      [() => desktop.setHiddenWindows(connectionId, ["weekly"]), { hiddenWindows: ["weekly"] }],
      [() => desktop.setHiddenWindows(connectionId, []), { hiddenWindows: undefined }],
      [
        () => desktop.setAutoPing(connectionId, true),
        { autoPing: { ...previewState.connections[0].autoPing, enabled: true } },
      ],
    ];
    for (const [execute, expected] of operations) {
      const state = await execute();
      expect(state.connections[0]).toMatchObject(expected);
      expect(state.connections.slice(1)).toEqual(original.connections.slice(1));
    }
    expect(
      (await desktop.removeConnection(connectionId)).connections.map((connection) => connection.id),
    ).not.toContain(connectionId);
    expect(previewState).toEqual(original);
    expect(native.invoke).not.toHaveBeenCalled();
  });

  test("preview settings return updated values without changing fixture defaults", async () => {
    const original = structuredClone(previewState.settings);
    expect((await desktop.setTraySummary(summary)).settings.traySummary).toEqual(summary);
    expect((await desktop.setTraySummary(null)).settings.traySummary).toBeUndefined();
    expect((await desktop.setMenuBarItemVisible(false)).settings.showMenuBarItem).toBe(false);
    expect((await desktop.setUpdateChannel("nightly")).settings.updateChannel).toBe("nightly");
    expect((await desktop.setTelemetryEnabled(false)).settings.telemetryEnabled).toBe(false);
    expect(previewState.settings).toEqual(original);
    expect(await desktop.setLaunchAtLogin(true)).toBe(true);
    expect(await desktop.getLaunchAtLogin()).toBe(true);
    expect(await desktop.setLaunchAtLogin(false)).toBe(false);
    expect(await desktop.ensureNotificationPermission()).toBe(true);
    expect(native.invoke).not.toHaveBeenCalled();
  });

  test("spending a preview credit resets only the chosen account", async () => {
    vi.useFakeTimers();
    const connection = previewState.connections.find((item) => item.resetCredits?.length);
    expect(connection).toBeDefined();
    const original = structuredClone(previewState);
    const creditId = connection!.resetCredits![0].id;
    const pending = desktop.spendResetCredit(connection!.id, creditId);
    await vi.runAllTimersAsync();
    const state = await pending;
    const changed = state.connections.find((item) => item.id === connection!.id)!;
    expect(changed.resetCredits?.map((credit) => credit.id)).not.toContain(creditId);
    expect(changed.windows.every((window) => window.usedPercent === 0)).toBe(true);
    expect(state.connections.filter((item) => item.id !== connection!.id)).toEqual(
      original.connections.filter((item) => item.id !== connection!.id),
    );
    expect(previewState).toEqual(original);
    expect(native.invoke).not.toHaveBeenCalled();
  });

  test("news uses the current fetch time without native access", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00Z"));
    const pending = desktop.getCodexResetsStatus();
    await vi.runAllTimersAsync();
    expect(await pending).toEqual({ ...previewCodexResets, fetchedAt: new Date().toISOString() });
    expect(native.invoke).not.toHaveBeenCalled();
  });

  test("native-only side effects are no-ops and external links use safe window flags", async () => {
    await desktop.cancelLogin("session");
    await desktop.sendTestNotification("account");
    await desktop.setLanguage("fr-FR");
    await desktop.openMainWindow();
    await desktop.hidePopover();
    await desktop.resizePopover(300);
    desktop.onCodexResetsStatus(vi.fn())();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    await desktop.openExternalUrl("https://example.test/");
    expect(open).toHaveBeenCalledWith("https://example.test/", "_blank", "noopener,noreferrer");
    expect(native.invoke).not.toHaveBeenCalled();
    expect(native.listen).not.toHaveBeenCalled();
    expect(native.setSize).not.toHaveBeenCalled();
  });
});
