"use client";

import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import {
  APPEARANCE_THEMES,
  CUSTOM_THEMES,
  THEMES,
  type ThemeOption,
} from "@/theme/registry";
import { useTheme } from "@/theme/ThemeContext";
import Select from "@/ui/Select";
import styles from "./ThemePicker.module.scss";

function displayName(theme: ThemeOption, language: string): string {
  return (
    theme.displayName[language] ??
    theme.displayName[DEFAULT_LOCALE] ??
    theme.nameKey
  );
}

/** A dropdown that previews a theme on hover and applies it on select. */
export default function ThemePicker() {
  const { t, i18n } = useTranslation();
  const { selectedTheme, setTheme, previewTheme, clearPreviewTheme } =
    useTheme();
  const current = THEMES.find((theme) => theme.className === selectedTheme);
  const CurrentThumbnail = current?.thumbnailSrc;

  const renderTheme = (theme: ThemeOption) => {
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
            <span>{displayName(theme, i18n.language)}</span>
          </span>
        </Select.ItemText>
        <Select.ItemIndicator />
      </Select.Item>
    );
  };

  return (
    <Select.Root
      onValueChange={(value) => value && setTheme(value)}
      value={selectedTheme}
    >
      <Select.Trigger aria-label={t("Common.Theme")} className={styles.trigger}>
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
            <span>
              {current
                ? displayName(current, i18n.language)
                : t("Common.Theme")}
            </span>
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
              <Select.Group>{APPEARANCE_THEMES.map(renderTheme)}</Select.Group>
              <Select.Group>
                <Select.GroupLabel>
                  {t("Common.CustomThemes")}
                </Select.GroupLabel>
                {CUSTOM_THEMES.map(renderTheme)}
              </Select.Group>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
