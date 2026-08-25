"use client";

import Select from "@/ui/Select";
import { THEMES } from "@/ui/themes/registry";
import { useTheme } from "@/ui/themes/ThemeContext";
import styles from "./ThemePicker.module.scss";

function displayName(theme: (typeof THEMES)[number]): string {
  return theme.displayName["en-US"] ?? theme.nameKey;
}

/** A dropdown that previews a theme on hover and applies it on select. */
export default function ThemePicker() {
  const { selectedTheme, setTheme, previewTheme, clearPreviewTheme } =
    useTheme();
  const current = THEMES.find((theme) => theme.className === selectedTheme);
  const CurrentThumbnail = current?.thumbnailSrc;

  return (
    <Select.Root
      aria-label="Theme"
      onValueChange={(value) => value && setTheme(value)}
      value={selectedTheme}
    >
      <Select.Trigger className={styles.trigger}>
        <Select.Value>
          <span className={styles.value}>
            {CurrentThumbnail && (
              <CurrentThumbnail
                aria-hidden
                className={styles.thumbnail}
                height={16}
                width={16}
              />
            )}
            <span>{current ? displayName(current) : "Theme"}</span>
          </span>
        </Select.Value>
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
          <Select.Popup
            className={styles.popup}
            onMouseLeave={clearPreviewTheme}
          >
            <Select.List>
              {THEMES.map((theme) => {
                const Thumbnail = theme.thumbnailSrc;
                return (
                  <Select.Item
                    key={theme.className}
                    onMouseEnter={() => previewTheme(theme.className)}
                    value={theme.className}
                  >
                    <Select.ItemText>
                      <span className={styles.item}>
                        <Thumbnail
                          aria-hidden
                          className={styles.thumbnail}
                          height={20}
                          width={20}
                        />
                        <span>{displayName(theme)}</span>
                      </span>
                    </Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                );
              })}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
