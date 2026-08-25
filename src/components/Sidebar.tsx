"use client";

import type { LucideIcon } from "lucide-react";
import BrandMark from "./BrandMark";
import styles from "./Sidebar.module.scss";

export interface SidebarItem<T extends string> {
  value: T;
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
  footer?: React.ReactNode;
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.handle} data-tauri-drag-region />
      <div className={styles.brand} data-tauri-drag-region>
        <BrandMark size={22} />
        <strong>Devie QT</strong>
      </div>
      <nav aria-label="Sections" className={styles.nav}>
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
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className={styles.grow} data-tauri-drag-region />
      {footer && <div className={styles.footer}>{footer}</div>}
    </aside>
  );
}
