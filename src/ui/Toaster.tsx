// https://devie-ui.com/components/toast

"use client";

import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import type React from "react";
import Toast from "./Toast";
import styles from "./Toaster.module.scss";

const icons: Record<string, React.ReactNode> = {
  info: <Info size={16} strokeWidth={1.5} />,
  success: <CheckCircle size={16} strokeWidth={1.5} />,
  warning: <AlertTriangle size={16} strokeWidth={1.5} />,
  danger: <XCircle size={16} strokeWidth={1.5} />,
} satisfies Record<Toast.Type, React.ReactNode>;

export function Toaster() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Viewport>
      {toasts.map((toast) => {
        const type = toast.type || "info";
        return (
          <Toast.Root key={toast.id} toast={toast} data-type={type}>
            <div className={styles.iconContainer}>{icons[type]}</div>
            <div className={styles.contentContainer}>
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
              {toast.actionProps && <Toast.Action {...toast.actionProps} />}
            </div>
            <Toast.Close aria-label="Close">
              <X size={16} />
            </Toast.Close>
          </Toast.Root>
        );
      })}
    </Toast.Viewport>
  );
}
