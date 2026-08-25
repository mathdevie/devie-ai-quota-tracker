// https://devie-ui.com/components/dialog
// https://base-ui.com/react/components/dialog

"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import * as React from "react";
import styles from "./Dialog.module.scss";

export type DialogSize = "sm" | "md" | "lg" | "xl";

const DialogInteractionContext = React.createContext<boolean | null>(null);
const DialogSizeContext = React.createContext<DialogSize>("md");

function Root({
  disableInteractions,
  size = "md",
  ...props
}: Dialog.Root.Props) {
  return (
    <DialogSizeContext.Provider value={size}>
      <DialogInteractionContext.Provider value={disableInteractions ?? null}>
        <BaseDialog.Root {...props} />
      </DialogInteractionContext.Provider>
    </DialogSizeContext.Provider>
  );
}

const createHandle = BaseDialog.createHandle;

function Trigger({ className, ...props }: BaseDialog.Trigger.Props) {
  return (
    <BaseDialog.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

const Portal = BaseDialog.Portal;

function Close({ className, render, ...props }: BaseDialog.Close.Props) {
  return (
    <BaseDialog.Close
      className={clsx(!render && styles.close, className)}
      render={render}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: BaseDialog.Backdrop.Props) {
  return (
    <BaseDialog.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Popup({
  className,
  disableInteractions,
  ...props
}: Dialog.Popup.Props) {
  const size = React.useContext(DialogSizeContext);
  const contextDisableInteractions = React.useContext(DialogInteractionContext);
  const resolvedDisableInteractions =
    disableInteractions ?? contextDisableInteractions ?? false;

  return (
    <BaseDialog.Popup
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

function Title({ className, ...props }: BaseDialog.Title.Props) {
  return (
    <BaseDialog.Title
      className={clsx(styles.title, className)}
      // biome-ignore lint/a11y/useHeadingContent: Base UI Title renders children into this heading
      render={<h3 />}
      {...props}
    />
  );
}

function Description({ className, ...props }: BaseDialog.Description.Props) {
  return (
    <BaseDialog.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Header({ className, ...props }: Dialog.Header.Props) {
  return <div className={clsx(styles.header, className)} {...props} />;
}

function Footer({ className, ...props }: Dialog.Footer.Props) {
  return <div className={clsx(styles.footer, className)} {...props} />;
}

function Body({ className, ...props }: Dialog.Body.Props) {
  return <div className={clsx(styles.body, className)} {...props} />;
}

const Dialog = {
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

namespace Dialog {
  export namespace Root {
    export interface Props extends BaseDialog.Root.Props {
      disableInteractions?: boolean;
      size?: DialogSize;
    }
  }
  export namespace Trigger {
    export type Props = BaseDialog.Trigger.Props;
  }
  export namespace Portal {
    export type Props = BaseDialog.Portal.Props;
  }
  export namespace Close {
    export type Props = BaseDialog.Close.Props;
  }
  export namespace Backdrop {
    export type Props = BaseDialog.Backdrop.Props;
  }
  export namespace Popup {
    export interface Props extends BaseDialog.Popup.Props {
      disableInteractions?: boolean;
    }
  }
  export namespace Title {
    export type Props = BaseDialog.Title.Props;
  }
  export namespace Description {
    export type Props = BaseDialog.Description.Props;
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

export default Dialog;
