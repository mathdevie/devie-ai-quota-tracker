// https://devie-ui.com/components/toast
// https://base-ui.com/react/components/toast

import { Toast as BaseToast } from "@base-ui/react/toast";
import clsx from "clsx";
import styles from "./Toast.module.scss";

const Provider = BaseToast.Provider;

const useToastManager = BaseToast.useToastManager;

function Viewport({ className, ...props }: Toast.Viewport.Props) {
  return (
    <BaseToast.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Root({ className, ...props }: Toast.Root.Props) {
  return <BaseToast.Root className={clsx(styles.root, className)} {...props} />;
}

function Title({ className, ...props }: Toast.Title.Props) {
  return (
    <BaseToast.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: Toast.Description.Props) {
  return (
    <BaseToast.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Action({ className, ...props }: Toast.Action.Props) {
  return (
    <BaseToast.Action className={clsx(styles.action, className)} {...props} />
  );
}

function Close({ className, ...props }: Toast.Close.Props) {
  return (
    <BaseToast.Close className={clsx(styles.close, className)} {...props} />
  );
}

const Toast = {
  Provider,
  useToastManager,
  Viewport,
  Root,
  Title,
  Description,
  Action,
  Close,
};

namespace Toast {
  export type Type = "info" | "success" | "warning" | "danger";
  export namespace Provider {
    export type Props = BaseToast.Provider.Props;
  }
  export namespace Viewport {
    export type Props = Omit<BaseToast.Viewport.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Root {
    export type Props = Omit<BaseToast.Root.Props, "className"> & {
      className?: string;
    };
    export type ToastObject = BaseToast.Root.ToastObject;
  }
  export namespace Title {
    export type Props = Omit<BaseToast.Title.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Description {
    export type Props = Omit<BaseToast.Description.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Action {
    export type Props = Omit<BaseToast.Action.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Close {
    export type Props = Omit<BaseToast.Close.Props, "className"> & {
      className?: string;
    };
  }
}

export default Toast;
