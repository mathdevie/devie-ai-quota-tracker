import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";

const native = vi.hoisted(() => ({ setTheme: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@tauri-apps/api/window", () => ({ getCurrentWindow: () => native }));
const key = "devie-quota-theme:v1";

function Controls() {
  const theme = useTheme();
  return (
    <>
      <output aria-label="Selected theme">{theme.selectedTheme}</output>
      <output aria-label="Primary color">{theme.primaryColor}</output>
      <button onClick={() => theme.setTheme("theme-dark")}>Select dark</button>
      <button onClick={() => theme.setTheme("system")}>Select system</button>
      <button onClick={() => theme.setTheme("not-a-theme")}>Select invalid</button>
      <button onClick={() => theme.previewTheme("theme-light")}>Preview light</button>
      <button onClick={() => theme.previewTheme("not-a-theme")}>Preview invalid</button>
      <button onClick={theme.clearPreviewTheme}>Clear preview</button>
    </>
  );
}

beforeEach(() => {
  native.setTheme.mockReset().mockResolvedValue(undefined);
});

test.each([
  ["theme-default", "theme-light"],
  ["theme-catpuccin-latte", "theme-catppuccin-latte"],
])("mount migrates %s and persists %s", (legacy, canonical) => {
  localStorage.setItem(key, legacy);
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  expect(screen.getByLabelText("Selected theme").textContent).toBe(canonical);
  expect(document.documentElement.dataset.devieTheme).toBe(canonical);
  expect(localStorage.getItem(key)).toBe(canonical);
});

test("preview changes appearance, not saved preference, and selection clears it", () => {
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  fireEvent.click(screen.getByText("Select dark"));
  fireEvent.click(screen.getByText("Preview light"));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-light");
  expect(localStorage.getItem(key)).toBe("theme-dark");
  expect(screen.getByLabelText("Selected theme").textContent).toBe("theme-dark");
  fireEvent.click(screen.getByText("Preview invalid"));
  fireEvent.click(screen.getByText("Select invalid"));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-light");
  fireEvent.click(screen.getByText("Clear preview"));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-dark");
  fireEvent.click(screen.getByText("Preview light"));
  fireEvent.click(screen.getByText("Select dark"));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-dark");
});

test("storage events migrate another window's selection and clear previews", () => {
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  fireEvent.click(screen.getByText("Preview light"));
  fireEvent(window, new StorageEvent("storage", { key, newValue: "theme-catpuccin-latte" }));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-catppuccin-latte");
  expect(localStorage.getItem(key)).toBe("theme-catppuccin-latte");
  for (const newValue of [null, "not-a-theme"])
    fireEvent(window, new StorageEvent("storage", { key, newValue }));
  fireEvent(window, new StorageEvent("storage", { key: "unrelated", newValue: "theme-dark" }));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-catppuccin-latte");
  fireEvent(window, new StorageEvent("storage", { key, newValue: "theme-dark" }));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-dark");
});

test("System follows OS changes, explicit themes do not, and listeners are cleaned up", () => {
  const media = new EventTarget();
  const query = Object.assign(media, { matches: false, media: "(prefers-color-scheme: dark)" });
  const removeMedia = vi.spyOn(query, "removeEventListener");
  const removeStorage = vi.spyOn(window, "removeEventListener");
  vi.stubGlobal("matchMedia", () => query);
  const { unmount } = render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  expect(document.documentElement.dataset.devieTheme).toBe("theme-light");
  act(() => {
    query.matches = true;
    query.dispatchEvent(new Event("change"));
  });
  expect(document.documentElement.dataset.devieTheme).toBe("theme-dark");
  fireEvent.click(screen.getByText("Select dark"));
  act(() => {
    query.matches = false;
    query.dispatchEvent(new Event("change"));
  });
  expect(document.documentElement.dataset.devieTheme).toBe("theme-dark");
  fireEvent.click(screen.getByText("Select system"));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-light");
  unmount();
  expect(removeMedia).toHaveBeenCalledWith("change", expect.any(Function));
  expect(removeStorage).toHaveBeenCalledWith("storage", expect.any(Function));
});

test("invalid saved values fall back to System", () => {
  localStorage.setItem(key, "retired-theme");
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  expect(screen.getByLabelText("Selected theme").textContent).toBe("system");
});

test("restricted storage does not prevent changing appearance", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("denied");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("denied");
  });
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  fireEvent.click(screen.getByText("Select dark"));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-dark");
});

test("reads the app primary color from the resolved CSS", () => {
  document.documentElement.style.setProperty("--devie__color__primary", "#123456");
  try {
    render(
      <ThemeProvider>
        <Controls />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText("Primary color").textContent).toBe("#123456");
  } finally {
    document.documentElement.style.removeProperty("--devie__color__primary");
  }
});

test("native appearance receives null for System and explicit light/dark for overrides", async () => {
  window.__TAURI_INTERNALS__ = {};
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  await waitFor(() => expect(native.setTheme).toHaveBeenLastCalledWith(null));
  fireEvent.click(screen.getByText("Select dark"));
  await waitFor(() => expect(native.setTheme).toHaveBeenLastCalledWith("dark"));
  fireEvent.click(screen.getByText("Preview light"));
  await waitFor(() => expect(native.setTheme).toHaveBeenLastCalledWith("light"));
});

test("a native appearance failure leaves the DOM theme usable", async () => {
  window.__TAURI_INTERNALS__ = {};
  native.setTheme.mockRejectedValue(new Error("window unavailable"));
  render(
    <ThemeProvider>
      <Controls />
    </ThemeProvider>,
  );
  await waitFor(() => expect(native.setTheme).toHaveBeenCalledWith(null));
  fireEvent.click(screen.getByText("Select dark"));
  await waitFor(() => expect(native.setTheme).toHaveBeenCalledWith("dark"));
  expect(document.documentElement.dataset.devieTheme).toBe("theme-dark");
});

test("useTheme requires its provider", () => {
  expect(() => render(<Controls />)).toThrow("useTheme must be used within a ThemeProvider");
});
