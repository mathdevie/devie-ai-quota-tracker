import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vite-plus/test";
import LoginDialog from "@/features/connections/LoginDialog";
import type { DashboardState, LoginStart } from "@/features/desktop/contracts";
import { previewState } from "@/features/desktop/fixtures";
import { account, deferred, renderApp } from "./helpers";

const native = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@tauri-apps/api/core", () => ({ invoke: native.invoke }));

const started: LoginStart = {
  sessionId: "session",
  provider: "claude",
  url: "https://example.com/login",
  acceptsManualCode: true,
};
beforeEach(() => {
  window.__TAURI_INTERNALS__ = {};
  native.invoke.mockReset();
});

it("submits a manual code to the existing waiter and completes once", async () => {
  const user = userEvent.setup();
  const finished = deferred<DashboardState>();
  native.invoke.mockImplementation((command: string) =>
    command === "start_login"
      ? Promise.resolve(started)
      : command === "finish_login"
        ? finished.promise
        : Promise.resolve(),
  );
  const connected = vi.fn();
  const close = vi.fn();
  renderApp(
    <LoginDialog
      provider="claude"
      open
      onOpenChange={close}
      onConnected={connected}
      renew={account()}
    />,
  );
  const input = await screen.findByRole("textbox");
  await user.type(input, " code#state ");
  await user.click(screen.getByRole("button", { name: "Use code" }));
  expect(native.invoke).toHaveBeenCalledWith("submit_login_code", {
    sessionId: "session",
    code: "code#state",
  });
  expect(native.invoke.mock.calls.filter(([command]) => command === "finish_login")).toHaveLength(
    1,
  );
  expect(connected).not.toHaveBeenCalled();
  vi.useFakeTimers();
  await act(async () => finished.resolve(previewState));
  expect(connected).toHaveBeenCalledExactlyOnceWith(previewState);
  await act(async () => vi.advanceTimersByTime(900));
  expect(close).toHaveBeenCalledWith(false);
});

it("cancels an active login and ignores its late completion", async () => {
  const finished = deferred<DashboardState>();
  native.invoke.mockImplementation((command: string) =>
    command === "start_login"
      ? Promise.resolve(started)
      : command === "finish_login"
        ? finished.promise
        : Promise.resolve(),
  );
  const connected = vi.fn();
  const view = renderApp(
    <LoginDialog provider="claude" open onOpenChange={vi.fn()} onConnected={connected} />,
  );
  await screen.findByRole("textbox");
  view.unmount();
  await waitFor(() =>
    expect(native.invoke).toHaveBeenCalledWith("cancel_login", { sessionId: "session" }),
  );
  await act(async () => finished.resolve(previewState));
  expect(connected).not.toHaveBeenCalled();
});

it("cancels a login that finishes starting after the dialog closed", async () => {
  const start = deferred<LoginStart>();
  native.invoke.mockImplementation((command: string) =>
    command === "start_login" ? start.promise : Promise.resolve(),
  );
  const view = renderApp(
    <LoginDialog provider="claude" open onOpenChange={vi.fn()} onConnected={vi.fn()} />,
  );
  await waitFor(() =>
    expect(native.invoke).toHaveBeenCalledWith("start_login", { provider: "claude" }),
  );
  view.unmount();
  await act(async () => start.resolve(started));
  expect(native.invoke).toHaveBeenCalledWith("cancel_login", { sessionId: "session" });
  expect(native.invoke.mock.calls.some(([command]) => command === "finish_login")).toBe(false);
});

it("shows setup failures and lets the user retry or close", async () => {
  const user = userEvent.setup();
  native.invoke.mockRejectedValue(new Error("Callback unavailable"));
  const close = vi.fn();
  renderApp(<LoginDialog provider="claude" open onOpenChange={close} onConnected={vi.fn()} />);
  expect(await screen.findByText("Callback unavailable")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(close).toHaveBeenCalledWith(false);
});

it("keeps manual submission errors visible and cancels the waiter on dismissal", async () => {
  const user = userEvent.setup();
  const finished = deferred<DashboardState>();
  native.invoke.mockImplementation((command: string) => {
    if (command === "start_login") return Promise.resolve(started);
    if (command === "finish_login") return finished.promise;
    if (command === "submit_login_code") return Promise.reject("Code rejected");
    return Promise.resolve();
  });
  const view = renderApp(
    <LoginDialog provider="claude" open onOpenChange={vi.fn()} onConnected={vi.fn()} />,
  );
  await user.type(await screen.findByRole("textbox"), "code");
  await user.click(screen.getByRole("button", { name: "Use code" }));
  expect(await screen.findByText("Code rejected")).toBeTruthy();
  view.unmount();
  await act(async () => finished.reject("Cancelled"));
  expect(native.invoke).toHaveBeenCalledWith("cancel_login", { sessionId: "session" });
});

it("displays and copies a device code without offering manual OAuth entry", async () => {
  const user = userEvent.setup();
  const finished = deferred<DashboardState>();
  native.invoke.mockImplementation((command: string) =>
    command === "start_login"
      ? Promise.resolve({
          ...started,
          provider: "copilot",
          userCode: "ABCD-1234",
          acceptsManualCode: false,
        })
      : finished.promise,
  );
  renderApp(<LoginDialog provider="copilot" open onOpenChange={vi.fn()} onConnected={vi.fn()} />);
  await user.click(await screen.findByRole("button", { name: "ABCD-1234" }));
  expect(await navigator.clipboard.readText()).toBe("ABCD-1234");
  expect(screen.queryByRole("textbox")).toBeNull();
});

it("does not start a closed dialog", () => {
  renderApp(
    <LoginDialog provider="claude" open={false} onOpenChange={vi.fn()} onConnected={vi.fn()} />,
  );
  expect(native.invoke).not.toHaveBeenCalled();
});
