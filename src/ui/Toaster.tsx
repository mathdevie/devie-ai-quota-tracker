// https://devie-ui.com/components/toast

"use client";

import { CheckCircle, Info, X, XCircle } from "lucide-react";
import Toast from "@/ui/Toast";
import styles from "./Toaster.module.scss";

export function Toaster() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Viewport>
      {toasts.map((toast) => {
        const type = toast.type || "info";
        return (
          <Toast.Root key={toast.id} toast={toast} data-type={type}>
            <div className={styles.iconContainer}>
              {type === "info" && <Info size={16} strokeWidth={1.5} />}
              {type === "success" && (
                <CheckCircle size={16} strokeWidth={1.5} />
              )}
              {type === "error" && <XCircle size={16} strokeWidth={1.5} />}
            </div>
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
