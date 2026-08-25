"use client";

import { Check } from "lucide-react";
import { THEMES } from "@/ui/themes/registry";
import { useTheme } from "@/ui/themes/ThemeContext";
import styles from "./ThemePicker.module.scss";

function displayName(theme: (typeof THEMES)[number]): string {
  return theme.displayName["en-US"] ?? theme.nameKey;
}

export default function ThemePicker() {
  const { selectedTheme, setTheme, previewTheme, clearPreviewTheme } =
    useTheme();

  return (
    <fieldset className={styles.grid}>
      <legend className={styles.legend}>Theme</legend>
      {THEMES.map((theme) => {
        const Thumbnail = theme.thumbnailSrc;
        const selected = theme.className === selectedTheme;
        return (
          <label
            className={styles.option}
            key={theme.className}
            onMouseEnter={() => previewTheme(theme.className)}
            onMouseLeave={clearPreviewTheme}
          >
            <input
              checked={selected}
              className={styles.input}
              name="theme"
              onBlur={clearPreviewTheme}
              onChange={() => setTheme(theme.className)}
              onFocus={() => previewTheme(theme.className)}
              type="radio"
              value={theme.className}
            />
            <span className={styles.thumbnail}>
              <Thumbnail aria-hidden />
              {selected && (
                <span className={styles.check}>
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className={styles.name}>{displayName(theme)}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
