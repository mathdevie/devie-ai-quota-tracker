// https://devie-ui.com/components/alert-dialog
// https://base-ui.com/react/components/alert-dialog

"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import clsx from "clsx";
import * as React from "react";
import styles from "./AlertDialog.module.scss";
import type { DialogSize } from "./Dialog";

export type { DialogSize };

const AlertDialogInteractionContext = React.createContext<boolean | null>(null);

const AlertDialogSizeContext = React.createContext<DialogSize>("md");

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

function Trigger({ className, ...props }: BaseAlertDialog.Trigger.Props) {
  return (
    <BaseAlertDialog.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

const Portal = BaseAlertDialog.Portal;

function Close({ className, render, ...props }: BaseAlertDialog.Close.Props) {
  return (
    <BaseAlertDialog.Close
      className={clsx(!render && styles.close, className)}
      render={render}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: BaseAlertDialog.Backdrop.Props) {
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
  const size = React.useContext(AlertDialogSizeContext);
  const contextDisableInteractions = React.useContext(
    AlertDialogInteractionContext,
  );
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
      aria-busy={resolvedDisableInteractions ? true : undefined}
      inert={resolvedDisableInteractions ? true : undefined}
      {...props}
    />
  );
}

function Title({ className, ...props }: BaseAlertDialog.Title.Props) {
  return (
    <BaseAlertDialog.Title
      className={clsx(styles.title, className)}
      // biome-ignore lint/a11y/useHeadingContent: Base UI Title renders children into this heading
      render={<h3 />}
      {...props}
    />
  );
}

function Description({
  className,
  ...props
}: BaseAlertDialog.Description.Props) {
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
    export type Props = BaseAlertDialog.Backdrop.Props;
  }
  export namespace Popup {
    export interface Props extends BaseAlertDialog.Popup.Props {
      disableInteractions?: boolean;
    }
  }
  export namespace Title {
    export type Props = BaseAlertDialog.Title.Props;
  }
  export namespace Description {
    export type Props = BaseAlertDialog.Description.Props;
  }
  export namespace Header {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Footer {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Body {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
}

export default AlertDialog;
