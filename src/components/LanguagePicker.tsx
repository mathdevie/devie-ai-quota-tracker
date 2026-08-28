"use client";

import { useTranslation } from "react-i18next";
import { getLocaleEndonym, getSortedLocaleOptions } from "@/i18n/locales";
import Select from "@/ui/Select";
import styles from "./ThemePicker.module.scss";

/** A dropdown with every supported language, named in that language. */
export default function LanguagePicker() {
  const { i18n, t } = useTranslation();
  const options = getSortedLocaleOptions(t, i18n.language);
  const current = getLocaleEndonym(i18n.language, t);

  return (
    <Select.Root
      onValueChange={(value) => value && void i18n.changeLanguage(value)}
      value={i18n.language}
    >
      <Select.Trigger
        aria-label={t("Settings.Language")}
        className={styles.trigger}
      >
        <Select.Value>{current}</Select.Value>
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
          <Select.Popup className={styles.popup}>
            <Select.List>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  <Select.ItemText>{option.endonym}</Select.ItemText>
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
