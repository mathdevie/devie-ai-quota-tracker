// https://devie-ui.com/components/popover
// https://base-ui.com/react/components/popover

import { Popover as BasePopover } from "@base-ui/react/popover";
import clsx from "clsx";
import { X } from "lucide-react";
import type React from "react";
import styles from "./Popover.module.scss";

const Root = BasePopover.Root;

const Trigger = BasePopover.Trigger;

const Portal = BasePopover.Portal;

function Backdrop({ className, ...props }: Popover.Backdrop.Props) {
  return (
    <BasePopover.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

const Positioner = BasePopover.Positioner;

function Popup({ className, ...props }: Popover.Popup.Props) {
  return (
    <BasePopover.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Arrow({ className, children, ...props }: Popover.Arrow.Props) {
  return (
    <BasePopover.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BasePopover.Arrow>
  );
}

function Title({ className, ...props }: Popover.Title.Props) {
  return (
    <BasePopover.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: Popover.Description.Props) {
  return (
    <BasePopover.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Close({ className, render, children, ...props }: Popover.Close.Props) {
  if (render) {
    return (
      <BasePopover.Close className={className} render={render} {...props}>
        {children}
      </BasePopover.Close>
    );
  }

  return (
    <BasePopover.Close
      aria-label={children ? undefined : "Close"}
      className={clsx(styles.close, className)}
      {...props}
    >
      {children ?? <X size={16} />}
    </BasePopover.Close>
  );
}

const Popover = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Arrow,
  Title,
  Description,
  Close,
};

namespace Popover {
  export namespace Root {
    export type Props = BasePopover.Root.Props;
  }
  export namespace Trigger {
    export type Props = BasePopover.Trigger.Props;
    export type State = BasePopover.Trigger.State;
  }
  export namespace Portal {
    export type Props = BasePopover.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = Omit<BasePopover.Backdrop.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Positioner {
    export type Props = BasePopover.Positioner.Props;
    export type State = BasePopover.Positioner.State;
  }
  export namespace Popup {
    export type Props = Omit<BasePopover.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BasePopover.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Title {
    export type Props = Omit<BasePopover.Title.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Description {
    export type Props = Omit<BasePopover.Description.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Close {
    export type Props = Omit<BasePopover.Close.Props, "className"> & {
      className?: string;
    };
  }
}

export default Popover;

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="20"
      height="10"
      viewBox="0 0 20 10"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8V10H18.5349V8C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className={styles.arrowFill}
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9V8C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8V9C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className={styles.arrowInnerStroke}
      />
    </svg>
  );
}
