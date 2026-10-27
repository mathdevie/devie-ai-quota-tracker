import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import QuotaBarsDialog from "@/components/QuotaBarsDialog";
import { account, deferred, quota, renderApp } from "./helpers";

describe("quota visibility preferences", () => {
  it("stays closed without a selected account", () => {
    renderApp(<QuotaBarsDialog onOpenChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("initializes switches, toggles both ways, drops obsolete keys, and saves the account", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onOpenChange = vi.fn();
    const connection = account({
      windows: [quota(), quota({ key: "weekly", label: "Weekly" })],
      hiddenWindows: ["weekly", "removed"],
    });
    renderApp(
      <QuotaBarsDialog connection={connection} onOpenChange={onOpenChange} onSubmit={onSubmit} />,
    );
    const session = await screen.findByRole("switch", { name: "Session" });
    const weekly = screen.getByRole("switch", { name: "Weekly" });
    expect(session.getAttribute("aria-checked")).toBe("true");
    expect(weekly.getAttribute("aria-checked")).toBe("false");
    await user.click(session);
    await user.click(weekly);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(connection.id, ["session"]);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(connection.hiddenWindows).toEqual(["weekly", "removed"]);
  });

  it("cancels without writing preferences", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    renderApp(
      <QuotaBarsDialog connection={account()} onOpenChange={onOpenChange} onSubmit={onSubmit} />,
    );
    await user.click(await screen.findByRole("switch", { name: "Session" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("waits for persistence and keeps failed saves open for retry", async () => {
    const user = userEvent.setup();
    const pending = deferred<boolean>();
    const onSubmit = vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValueOnce(true);
    const onOpenChange = vi.fn();
    renderApp(
      <QuotaBarsDialog connection={account()} onOpenChange={onOpenChange} onSubmit={onSubmit} />,
    );
    await user.click(await screen.findByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
    await act(async () => pending.resolve(false));
    expect(screen.getByRole("dialog")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("uses status text for unlimited and availability-only windows", async () => {
    renderApp(
      <QuotaBarsDialog
        connection={account({
          windows: [
            quota({ unlimited: true }),
            quota({ key: "credits", label: "Credits", paid: true, usedPercent: 0 }),
            quota({
              key: "weekly",
              label: "Weekly",
              resetsAt: new Date(Date.now() + 3600000).toISOString(),
            }),
          ],
        })}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    await screen.findByRole("dialog");
    expect(screen.getByText("Unlimited")).toBeTruthy();
    expect(screen.getByText("Available")).toBeTruthy();
    expect(screen.getByText(/60% left.*resets/)).toBeTruthy();
  });
});
