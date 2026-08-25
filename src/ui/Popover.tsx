// https://devie-ui.com/components/popover
// https://base-ui.com/react/components/popover

import { Popover as BasePopover } from "@base-ui/react/popover";
import clsx from "clsx";
import { X } from "lucide-react";
import styles from "./Popover.module.scss";

const Root = BasePopover.Root;

function Trigger({ className, render, ...props }: BasePopover.Trigger.Props) {
  return (
    <BasePopover.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

const Portal = BasePopover.Portal;

function Backdrop({ className, ...props }: BasePopover.Backdrop.Props) {
  return (
    <BasePopover.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Positioner({ className, ...props }: BasePopover.Positioner.Props) {
  return (
    <BasePopover.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BasePopover.Popup.Props) {
  return (
    <BasePopover.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Arrow({ className, ...props }: BasePopover.Arrow.Props) {
  return (
    <BasePopover.Arrow className={clsx(styles.arrow, className)} {...props} />
  );
}

function Title({ className, ...props }: BasePopover.Title.Props) {
  return (
    <BasePopover.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: BasePopover.Description.Props) {
  return (
    <BasePopover.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Close({
  className,
  render,
  children,
  ...props
}: BasePopover.Close.Props) {
  if (render) {
    return (
      <BasePopover.Close className={className} render={render} {...props} />
    );
  }

  return (
    <BasePopover.Close className={clsx(styles.close, className)} {...props}>
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
    export type Props = BasePopover.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BasePopover.Positioner.Props;
    export type State = BasePopover.Positioner.State;
  }
  export namespace Popup {
    export type Props = BasePopover.Popup.Props;
  }
  export namespace Arrow {
    export type Props = BasePopover.Arrow.Props;
  }
  export namespace Title {
    export type Props = BasePopover.Title.Props;
  }
  export namespace Description {
    export type Props = BasePopover.Description.Props;
  }
  export namespace Close {
    export type Props = BasePopover.Close.Props;
  }
}

export default Popover;
