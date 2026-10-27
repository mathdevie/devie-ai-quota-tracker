import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vite-plus/test";
import QuotaBars, { quotaLevel, quotaStatusText, untilText } from "@/components/QuotaBars";
import { quota, renderApp, testI18n } from "./helpers";

test.each([
  [0, "danger"],
  [24.99, "danger"],
  [25, "warning"],
  [49.99, "warning"],
  [50, "ok"],
  [100, "ok"],
] as const)("%s%% remaining has level %s", (left, expected) => {
  expect(quotaLevel(left)).toBe(expected);
});

test.each([
  [-1, "now"],
  [0, "now"],
  [1, "1m"],
  [59, "59m"],
  [60, "1h 0m"],
  [253, "4h 13m"],
  [1440, "1d 0h"],
  [8880, "6d 4h"],
])("reset countdown at %s minutes", (minutes, expected) => {
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-27T12:00:00Z"));
  expect(untilText(testI18n.t, new Date(Date.now() + Number(minutes) * 60_000).toISOString())).toBe(
    expected,
  );
  expect(untilText(testI18n.t)).toBeUndefined();
});

test("limited allowances display remaining quota and pin the selected key", () => {
  const onPin = vi.fn();
  renderApp(<QuotaBars windows={[quota({ usedPercent: 76 })]} pinnedKey="session" onPin={onPin} />);
  expect(screen.getByText("24%")).toBeTruthy();
  const button = screen.getByRole("button", { name: "Pinned to menu bar" });
  expect(button.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(button);
  expect(onPin).toHaveBeenCalledExactlyOnceWith("session");
});

test("a different quota can be pinned", () => {
  const onPin = vi.fn();
  renderApp(<QuotaBars windows={[quota()]} onPin={onPin} />);
  const button = screen.getByRole("button", { name: "Pin to menu bar" });
  expect(button.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(button);
  expect(onPin).toHaveBeenCalledWith("session");
});

test("spent allowances clamp to zero remaining rather than a negative percent", () => {
  renderApp(<QuotaBars windows={[quota({ usedPercent: 125 })]} size="sm" />);
  expect(screen.getByText("0%")).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
});

test.each([
  [0, "Available"],
  [100, "Limit reached"],
])("availability-only credits (%s) never display a percentage or pin", (usedPercent, status) => {
  renderApp(
    <QuotaBars
      windows={[quota({ key: "credits", paid: true, usedPercent: Number(usedPercent) })]}
      onPin={vi.fn()}
    />,
  );
  expect(screen.getByText(status)).toBeTruthy();
  expect(screen.queryByText(/%/)).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
});

test("unlimited quotas show spent currency rather than an artificial percentage", () => {
  renderApp(
    <QuotaBars
      windows={[quota({ unlimited: true, amount: { used: 3, total: 0, unit: "USD" } })]}
    />,
  );
  expect(screen.getByText("Unlimited", { exact: false })).toBeTruthy();
  expect(screen.getByText("$3.00 spent")).toBeTruthy();
  expect(screen.queryByText(/%/)).toBeNull();
});

test.each([
  [{ total: 12.5, unit: "USD" }, "$12.50 left"],
  [{ total: 12, unit: "credits" }, "12 credits left"],
  [{ total: 12 }, "12 left"],
  [{ used: 677, total: 1500, unit: "credits" }, "677 / 1,500 credits"],
  [{ used: 600.34, total: 600, unit: "USD" }, "$600.34 / $600.00"],
  [{ used: 2, total: 10 }, "2 / 10"],
])("renders an absolute allowance %j", (amount, text) => {
  renderApp(<QuotaBars windows={[quota({ amount })]} />);
  expect(screen.getByText(text)).toBeTruthy();
  if (!("used" in amount)) expect(screen.queryByText(/%/)).toBeNull();
});

test("Copilot credit overages include their USD equivalent", () => {
  renderApp(
    <QuotaBars
      windows={[quota({ amount: { used: 1500, total: 1500, unit: "credits", overage: 12 } })]}
    />,
  );
  expect(screen.getByText(/\+12 over \(\$0.12\)/)).toBeTruthy();
});

test("currency overages do not receive a second conversion", () => {
  renderApp(
    <QuotaBars windows={[quota({ amount: { used: 15, total: 10, unit: "USD", overage: 5 } })]} />,
  );
  expect(screen.getByText(/\+\$5.00 over/)).toBeTruthy();
});

test("status helper leaves measurable windows alone", () => {
  expect(quotaStatusText(testI18n.t, quota())).toBeUndefined();
  expect(quotaStatusText(testI18n.t, quota({ unlimited: true }))).toBe("Unlimited");
});

test("a reset countdown exposes the full localized date on hover", async () => {
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-27T12:00:00Z"));
  const user = userEvent.setup();
  renderApp(<QuotaBars windows={[quota({ resetsAt: "2026-10-27T13:00:00Z" })]} />);
  await user.hover(screen.getByText("1h 0m"));
  expect(await screen.findByText("Resets on October 27, 2026 1:00 PM")).toBeTruthy();
});
