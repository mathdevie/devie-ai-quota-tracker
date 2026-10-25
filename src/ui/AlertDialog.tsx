// https://devie-ui.com/components/alert-dialog
// https://base-ui.com/react/components/alert-dialog

"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import clsx from "clsx";
import type React from "react";
import { createContext, useContext } from "react";
import styles from "./AlertDialog.module.scss";

type DialogSize = "sm" | "md" | "lg" | "xl";

const AlertDialogInteractionContext = createContext<boolean | null>(null);
const AlertDialogSizeContext = createContext<DialogSize>("md");

function Root({
  disableInteractions,
  size = "md",
  ...props
}: AlertDialog.Root.Props) {
  return (
    <AlertDialogSizeContext.Provider value={size}>
      <AlertDialogInteractionContext.Provider
        value={disableInteractions ?? null}
      >
        <BaseAlertDialog.Root {...props} />
      </AlertDialogInteractionContext.Provider>
    </AlertDialogSizeContext.Provider>
  );
}

const createHandle = BaseAlertDialog.createHandle;

const Trigger = BaseAlertDialog.Trigger;

const Portal = BaseAlertDialog.Portal;

const Close = BaseAlertDialog.Close;

function Backdrop({ className, ...props }: AlertDialog.Backdrop.Props) {
  return (
    <BaseAlertDialog.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Popup({
  className,
  disableInteractions,
  ...props
}: AlertDialog.Popup.Props) {
  const size = useContext(AlertDialogSizeContext);
  const contextDisableInteractions = useContext(AlertDialogInteractionContext);
  const resolvedDisableInteractions =
    disableInteractions ?? contextDisableInteractions ?? false;

  return (
    <BaseAlertDialog.Popup
      className={clsx(
        styles.popup,
        size === "sm" && styles.popupSm,
        size === "md" && styles.popupMd,
        size === "lg" && styles.popupLg,
        size === "xl" && styles.popupXl,
        resolvedDisableInteractions && styles.popupNonInteractive,
        className,
      )}
      inert={resolvedDisableInteractions ? true : undefined}
      {...props}
    />
  );
}

function Title({ className, ...props }: AlertDialog.Title.Props) {
  return (
    <BaseAlertDialog.Title
      className={clsx(styles.title, className)}
      // biome-ignore lint/a11y/useHeadingContent: Base UI Title renders children into this heading
      render={<h3 />}
      {...props}
    />
  );
}

function Description({ className, ...props }: AlertDialog.Description.Props) {
  return (
    <BaseAlertDialog.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Header({ className, ...props }: AlertDialog.Header.Props) {
  return <div className={clsx(styles.header, className)} {...props} />;
}

function Footer({ className, ...props }: AlertDialog.Footer.Props) {
  return <div className={clsx(styles.footer, className)} {...props} />;
}

function Body({ className, ...props }: AlertDialog.Body.Props) {
  return <div className={clsx(styles.body, className)} {...props} />;
}

const AlertDialog = {
  Root,
  createHandle,
  Trigger,
  Portal,
  Close,
  Backdrop,
  Popup,
  Header,
  Footer,
  Title,
  Description,
  Body,
};

namespace AlertDialog {
  export type Size = DialogSize;
  export namespace Root {
    export interface Props extends BaseAlertDialog.Root.Props {
      disableInteractions?: boolean;
      size?: DialogSize;
    }
  }
  export namespace Trigger {
    export type Props = BaseAlertDialog.Trigger.Props;
  }
  export namespace Portal {
    export type Props = BaseAlertDialog.Portal.Props;
  }
  export namespace Close {
    export type Props = BaseAlertDialog.Close.Props;
  }
  export namespace Backdrop {
    export type Props = Omit<BaseAlertDialog.Backdrop.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Popup {
    export interface Props
      extends Omit<BaseAlertDialog.Popup.Props, "className"> {
      className?: string;
      disableInteractions?: boolean;
    }
  }
  export namespace Title {
    export type Props = Omit<BaseAlertDialog.Title.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Description {
    export type Props = Omit<BaseAlertDialog.Description.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Header {
    export type Props = React.ComponentProps<"div">;
  }
  export namespace Footer {
    export type Props = React.ComponentProps<"div">;
  }
  export namespace Body {
    export type Props = React.ComponentProps<"div">;
  }
}

export default AlertDialog;
