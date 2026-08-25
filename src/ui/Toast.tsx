// https://devie-ui.com/components/toast
// https://base-ui.com/react/components/toast

"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import clsx from "clsx";
import styles from "./Toast.module.scss";

/**
 * NOTE: Toast.Provider must be imported directly from '@base-ui/react/toast'
 * in your layout because React context can't be properly re-exported.
 *
 * Usage:
 * 1. In layout.tsx: import { Toast } from '@base-ui/react/toast';
 * 2. Elsewhere: import Toast from '@/ui/Toast';
 */

const useToastManager = BaseToast.useToastManager;

function Viewport({ className, ...props }: BaseToast.Viewport.Props) {
  return (
    <BaseToast.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Root({ className, ...props }: BaseToast.Root.Props) {
  return <BaseToast.Root className={clsx(styles.root, className)} {...props} />;
}

function Title({ className, ...props }: BaseToast.Title.Props) {
  return (
    <BaseToast.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: BaseToast.Description.Props) {
  return (
    <BaseToast.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Action({ className, ...props }: BaseToast.Action.Props) {
  return (
    <BaseToast.Action className={clsx(styles.action, className)} {...props} />
  );
}

function Close({ className, ...props }: BaseToast.Close.Props) {
  return (
    <BaseToast.Close className={clsx(styles.close, className)} {...props} />
  );
}

const Toast = {
  useToastManager,
  Viewport,
  Root,
  Title,
  Description,
  Action,
  Close,
};

namespace Toast {
  export namespace Viewport {
    export type Props = BaseToast.Viewport.Props;
  }
  export namespace Root {
    export type Props = BaseToast.Root.Props;
    export type ToastObject = BaseToast.Root.ToastObject;
  }
  export namespace Title {
    export type Props = BaseToast.Title.Props;
  }
  export namespace Description {
    export type Props = BaseToast.Description.Props;
  }
  export namespace Action {
    export type Props = BaseToast.Action.Props;
  }
  export namespace Close {
    export type Props = BaseToast.Close.Props;
  }
}

export default Toast;
