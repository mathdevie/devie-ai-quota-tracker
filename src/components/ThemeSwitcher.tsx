"use client";

import { Palette } from "lucide-react";
import Select from "@/ui/Select";
import { THEMES } from "@/ui/themes/registry";
import { useTheme } from "@/ui/themes/ThemeContext";
import styles from "./ThemeSwitcher.module.scss";

function displayName(theme: (typeof THEMES)[number]): string {
  return theme.displayName["en-US"] ?? theme.nameKey;
}

export default function ThemeSwitcher() {
  const { selectedTheme, setTheme } = useTheme();
  const currentTheme = THEMES.find(
    (theme) => theme.className === selectedTheme,
  );

  return (
    <Select.Root
      onValueChange={(value) => value && setTheme(value)}
      value={selectedTheme}
    >
      <Select.Trigger
        aria-label="Change theme"
        className={styles.trigger}
        title={currentTheme ? displayName(currentTheme) : "Theme"}
      >
        <Palette aria-hidden size={16} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
          <Select.Popup className={styles.popup}>
            <Select.List>
              {THEMES.map((theme) => (
                <Select.Item key={theme.className} value={theme.className}>
                  <Select.ItemText>{displayName(theme)}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
