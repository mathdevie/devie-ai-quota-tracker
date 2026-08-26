"use client";

import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import BrandMark from "./BrandMark";
import styles from "./Sidebar.module.scss";

export interface SidebarItem<T extends string> {
  value: T;
  /** A translation key. */
  label: string;
  icon: LucideIcon;
}

export default function Sidebar<T extends string>({
  items,
  value,
  onChange,
  footer,
}: {
  items: SidebarItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Sits above the brand, for example an update button. */
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.handle} data-tauri-drag-region />
      <nav aria-label={t("Nav.Sections")} className={styles.nav}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.value === value;
          return (
            <button
              aria-current={active ? "page" : undefined}
              className={styles.item}
              key={item.value}
              onClick={() => onChange(item.value)}
              type="button"
            >
              <Icon aria-hidden size={16} strokeWidth={1.8} />
              <span>{t(item.label)}</span>
            </button>
          );
        })}
      </nav>
      <div className={styles.grow} data-tauri-drag-region />
      {footer && <div className={styles.footer}>{footer}</div>}
      <div className={styles.brand} data-tauri-drag-region>
        <BrandMark size={20} />
        <strong>{t("Common.AppName")}</strong>
      </div>
    </aside>
  );
}
