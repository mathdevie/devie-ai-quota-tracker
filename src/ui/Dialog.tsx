// https://devie-ui.com/components/dialog
// https://base-ui.com/react/components/dialog

"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import type React from "react";
import { createContext, useContext } from "react";
import styles from "./Dialog.module.scss";

type DialogSize = "sm" | "md" | "lg" | "xl";

const DialogInteractionContext = createContext<boolean | null>(null);
const DialogSizeContext = createContext<DialogSize>("md");

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

const Trigger = BaseDialog.Trigger;

const Portal = BaseDialog.Portal;

const Close = BaseDialog.Close;

function Backdrop({ className, ...props }: Dialog.Backdrop.Props) {
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
  const size = useContext(DialogSizeContext);
  const contextDisableInteractions = useContext(DialogInteractionContext);
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
      inert={resolvedDisableInteractions ? true : undefined}
      {...props}
    />
  );
}

function Title({ className, ...props }: Dialog.Title.Props) {
  return (
    <BaseDialog.Title
      className={clsx(styles.title, className)}
      // biome-ignore lint/a11y/useHeadingContent: Base UI Title renders children into this heading
      render={<h3 />}
      {...props}
    />
  );
}

function Description({ className, ...props }: Dialog.Description.Props) {
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
  export type Size = DialogSize;
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
    export type Props = Omit<BaseDialog.Backdrop.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Popup {
    export interface Props extends Omit<BaseDialog.Popup.Props, "className"> {
      className?: string;
      disableInteractions?: boolean;
    }
  }
  export namespace Title {
    export type Props = Omit<BaseDialog.Title.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Description {
    export type Props = Omit<BaseDialog.Description.Props, "className"> & {
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

export default Dialog;
