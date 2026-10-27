import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import ResetCredits from "@/features/connections/ResetCredits";
import { account, deferred, renderApp } from "./helpers";

const connection = account({
  customLabel: "Work",
  resetCredits: [
    { id: "credit-one" },
    { id: "credit-two", title: "Bonus reset", expiresAt: "2026-12-01T12:00:00Z" },
  ],
});

async function openConfirmation(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "2 resets available" }));
  await user.click((await screen.findAllByRole("button", { name: "Use" }))[0]);
  const dialog = await screen.findByRole("alertdialog");
  await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  return dialog;
}

describe("reset credit confirmation", () => {
  it("renders nothing when there are no credits", () => {
    const { container } = renderApp(<ResetCredits connection={account()} onUseReset={vi.fn()} />);
    expect(container.textContent).toBe("");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("opens the real badge button by keyboard and lists credit details", async () => {
    const user = userEvent.setup();
    const onUseReset = vi.fn();
    renderApp(<ResetCredits compact connection={connection} onUseReset={onUseReset} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "2 resets available" }));
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Bonus reset")).toBeTruthy();
    expect(screen.getByText("Rate limit reset")).toBeTruthy();
    expect(screen.getByText("No expiration")).toBeTruthy();
    expect(screen.getByText(/Expires/)).toBeTruthy();
    expect(onUseReset).not.toHaveBeenCalled();
  });

  it.each(["Cancel", "Escape"])("does not spend a credit after %s", async (method) => {
    const user = userEvent.setup();
    const onUseReset = vi.fn();
    renderApp(<ResetCredits connection={connection} onUseReset={onUseReset} />);
    const dialog = await openConfirmation(user);
    expect(dialog.textContent).toContain("Work");
    if (method === "Cancel")
      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    else await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(onUseReset).not.toHaveBeenCalled();
  });

  it("spends the selected credit once, locks dismissal while pending, and closes on success", async () => {
    const user = userEvent.setup();
    const pending = deferred<boolean>();
    const onUseReset = vi.fn(() => pending.promise);
    const onOverlayChange = vi.fn();
    renderApp(
      <ResetCredits
        connection={connection}
        onUseReset={onUseReset}
        onOverlayChange={onOverlayChange}
      />,
    );
    const dialog = await openConfirmation(user);
    expect(onOverlayChange).toHaveBeenLastCalledWith(true);
    const confirm = within(dialog).getByRole("button", { name: "Reset limits" });
    await user.dblClick(confirm);
    expect(onUseReset).toHaveBeenCalledExactlyOnceWith(connection.id, "credit-one");
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
    expect(
      (within(dialog).getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    await user.keyboard("{Escape}");
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    await act(async () => pending.resolve(true));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(onOverlayChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("button", { name: "Use" })).toBeNull();
  });

  it("retains a failed confirmation for retry and releases overlay state on unmount", async () => {
    const user = userEvent.setup();
    const onUseReset = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const onOverlayChange = vi.fn();
    const { unmount } = renderApp(
      <ResetCredits
        connection={connection}
        onUseReset={onUseReset}
        onOverlayChange={onOverlayChange}
      />,
    );
    const dialog = await openConfirmation(user);
    await user.click(within(dialog).getByRole("button", { name: "Reset limits" }));
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Reset limits" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(onUseReset).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("button", { name: "2 resets available" }));
    expect(onOverlayChange).toHaveBeenLastCalledWith(true);
    unmount();
    expect(onOverlayChange).toHaveBeenLastCalledWith(false);
  });
});
