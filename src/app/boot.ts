/**
 * Runs before the first paint, so a saved theme never flashes the default.
 * Legacy values are migrated and persisted here; ThemeContext repeats the
 * migration for storage events from other windows.
 */
export function themeBootScript(allowedThemes: readonly string[]) {
  return `(() => {
  try {
    const key = "devie-quota-theme:v1";
    const allowed = new Set(${JSON.stringify(allowedThemes)});
    const system = () => matchMedia("(prefers-color-scheme: dark)").matches
      ? "theme-dark"
      : "theme-light";
    let saved = localStorage.getItem(key);
    if (saved === "theme-default") saved = "theme-light";
    if (saved === "theme-catpuccin-latte") saved = "theme-catppuccin-latte";
    if (allowed.has(saved)) localStorage.setItem(key, saved);
    if (!allowed.has(saved)) {
      saved = "system";
      localStorage.setItem(key, saved);
    }
    document.documentElement.dataset.devieTheme =
      saved === "system" ? system() : saved;
  } catch {
    document.documentElement.dataset.devieTheme = "theme-light";
  }
})();`;
}
