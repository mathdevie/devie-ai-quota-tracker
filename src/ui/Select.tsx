// https://devie-ui.com/components/select
// https://base-ui.com/react/components/select

import { Select as BaseSelect } from "@base-ui/react/select";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./Select.module.scss";

const Root = BaseSelect.Root;

function Label({ className, ...props }: Select.Label.Props) {
  return (
    <BaseSelect.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Trigger({ className, ...props }: Select.Trigger.Props) {
  return (
    <BaseSelect.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

function Value({ className, ...props }: Select.Value.Props) {
  return (
    <BaseSelect.Value className={clsx(styles.value, className)} {...props} />
  );
}

function Icon({ className, children, ...props }: Select.Icon.Props) {
  return (
    <BaseSelect.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseSelect.Icon>
  );
}

const Portal = BaseSelect.Portal;

const Positioner = BaseSelect.Positioner;

function Popup({ className, ...props }: Select.Popup.Props) {
  return (
    <BaseSelect.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function List({ className, ...props }: Select.List.Props) {
  return (
    <BaseSelect.List className={clsx(styles.list, className)} {...props} />
  );
}

function Item({ className, ...props }: Select.Item.Props) {
  return (
    <BaseSelect.Item className={clsx(styles.item, className)} {...props} />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: Select.ItemIndicator.Props) {
  return (
    <BaseSelect.ItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseSelect.ItemIndicator>
  );
}

function ItemText({ className, ...props }: Select.ItemText.Props) {
  return (
    <BaseSelect.ItemText
      className={clsx(styles.itemText, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: Select.Arrow.Props) {
  return (
    <BaseSelect.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseSelect.Arrow>
  );
}

function ScrollUpArrow({ className, ...props }: Select.ScrollUpArrow.Props) {
  return (
    <BaseSelect.ScrollUpArrow
      className={clsx(styles.scrollArrow, className)}
      {...props}
    />
  );
}

function ScrollDownArrow({
  className,
  ...props
}: Select.ScrollDownArrow.Props) {
  return (
    <BaseSelect.ScrollDownArrow
      className={clsx(styles.scrollArrow, className)}
      {...props}
    />
  );
}

const Backdrop = BaseSelect.Backdrop;

function Group({ className, ...props }: Select.Group.Props) {
  return (
    <BaseSelect.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: Select.GroupLabel.Props) {
  return (
    <BaseSelect.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: Select.Separator.Props) {
  return (
    <BaseSelect.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Select = {
  Root,
  Label,
  Trigger,
  Value,
  Icon,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  List,
  Arrow,
  ScrollUpArrow,
  ScrollDownArrow,
  Item,
  ItemIndicator,
  ItemText,
  Group,
  GroupLabel,
  Separator,
};

namespace Select {
  export namespace Root {
    export type Props<Value> = BaseSelect.Root.Props<Value>;
    export type ChangeEventDetails = BaseSelect.Root.ChangeEventDetails;
    export type ChangeEventReason = BaseSelect.Root.ChangeEventReason;
  }
  export namespace Label {
    export type Props = Omit<BaseSelect.Label.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseSelect.Trigger.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSelect.Trigger.State;
  }
  export namespace Value {
    export type Props = Omit<BaseSelect.Value.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Icon {
    export type Props = Omit<BaseSelect.Icon.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Portal {
    export type Props = BaseSelect.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseSelect.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseSelect.Positioner.Props;
    export type State = BaseSelect.Positioner.State;
  }
  export namespace Popup {
    export type Props = Omit<BaseSelect.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace List {
    export type Props = Omit<BaseSelect.List.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseSelect.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace ScrollUpArrow {
    export type Props = Omit<BaseSelect.ScrollUpArrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace ScrollDownArrow {
    export type Props = Omit<BaseSelect.ScrollDownArrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseSelect.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSelect.Item.State;
  }
  export namespace ItemIndicator {
    export type Props = Omit<BaseSelect.ItemIndicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace ItemText {
    export type Props = Omit<BaseSelect.ItemText.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = Omit<BaseSelect.Group.Props, "className"> & {
      className?: string;
    };
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseSelect.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Separator {
    export type Props = Omit<BaseSelect.Separator.Props, "className"> & {
      className?: string;
    };
  }
}

export default Select;

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
