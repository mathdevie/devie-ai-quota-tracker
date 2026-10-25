// https://devie-ui.com/components/combobox
// https://base-ui.com/react/components/combobox

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import clsx from "clsx";
import { Check, ChevronDown, X } from "lucide-react";
import type React from "react";
import styles from "./Combobox.module.scss";

const Root = BaseCombobox.Root;

function Label({ className, ...props }: Combobox.Label.Props) {
  return (
    <BaseCombobox.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Input({ className, ...props }: Combobox.Input.Props) {
  return (
    <BaseCombobox.Input className={clsx(styles.input, className)} {...props} />
  );
}

function InputGroup({ className, ...props }: Combobox.InputGroup.Props) {
  return (
    <BaseCombobox.InputGroup
      className={clsx(styles.inputGroup, className)}
      {...props}
    />
  );
}

function Trigger({ className, render, ...props }: Combobox.Trigger.Props) {
  return (
    <BaseCombobox.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({ className, children, ...props }: Combobox.Icon.Props) {
  return (
    <BaseCombobox.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseCombobox.Icon>
  );
}

function Clear({ className, children, ...props }: Combobox.Clear.Props) {
  return (
    <BaseCombobox.Clear
      aria-label={children ? undefined : "Clear"}
      className={clsx(styles.clear, className)}
      {...props}
    >
      {children || <X size={16} />}
    </BaseCombobox.Clear>
  );
}

const Portal = BaseCombobox.Portal;

const Backdrop = BaseCombobox.Backdrop;

const Positioner = BaseCombobox.Positioner;

function Popup({ className, ...props }: Combobox.Popup.Props) {
  return (
    <BaseCombobox.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Arrow({ className, children, ...props }: Combobox.Arrow.Props) {
  return (
    <BaseCombobox.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseCombobox.Arrow>
  );
}

function List({ className, ...props }: Combobox.List.Props) {
  return (
    <BaseCombobox.List className={clsx(styles.list, className)} {...props} />
  );
}

function Status({ className, ...props }: Combobox.Status.Props) {
  return (
    <BaseCombobox.Status
      className={clsx(styles.status, className)}
      {...props}
    />
  );
}

function Empty({ className, ...props }: Combobox.Empty.Props) {
  return (
    <BaseCombobox.Empty className={clsx(styles.empty, className)} {...props} />
  );
}

const Collection = BaseCombobox.Collection;

function Row({ className, ...props }: Combobox.Row.Props) {
  return (
    <BaseCombobox.Row className={clsx(styles.row, className)} {...props} />
  );
}

function Item({ className, ...props }: Combobox.Item.Props) {
  return (
    <BaseCombobox.Item className={clsx(styles.item, className)} {...props} />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: Combobox.ItemIndicator.Props) {
  return (
    <BaseCombobox.ItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseCombobox.ItemIndicator>
  );
}

function Group({ className, ...props }: Combobox.Group.Props) {
  return (
    <BaseCombobox.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: Combobox.GroupLabel.Props) {
  return (
    <BaseCombobox.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: Combobox.Separator.Props) {
  return (
    <BaseCombobox.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Value = BaseCombobox.Value;

function Chips({ className, ...props }: Combobox.Chips.Props) {
  return (
    <BaseCombobox.Chips className={clsx(styles.chips, className)} {...props} />
  );
}

function Chip({ className, ...props }: Combobox.Chip.Props) {
  return (
    <BaseCombobox.Chip className={clsx(styles.chip, className)} {...props} />
  );
}

function ChipRemove({
  className,
  children,
  ...props
}: Combobox.ChipRemove.Props) {
  return (
    <BaseCombobox.ChipRemove
      aria-label={children ? undefined : "Remove"}
      className={clsx(styles.chipRemove, className)}
      {...props}
    >
      {children || <X size={12} />}
    </BaseCombobox.ChipRemove>
  );
}

const useFilter = BaseCombobox.useFilter;

const Combobox = {
  Root,
  Label,
  Input,
  InputGroup,
  Trigger,
  Icon,
  Clear,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Arrow,
  List,
  Status,
  Empty,
  Collection,
  Row,
  Item,
  ItemIndicator,
  Group,
  GroupLabel,
  Separator,
  Value,
  Chips,
  Chip,
  ChipRemove,
  useFilter,
};

namespace Combobox {
  export namespace Root {
    export type Props<
      Value,
      Multiple extends boolean = false,
    > = BaseCombobox.Root.Props<Value, Multiple>;
    export type ChangeEventDetails = BaseCombobox.Root.ChangeEventDetails;
    export type ChangeEventReason = BaseCombobox.Root.ChangeEventReason;
  }
  export namespace Input {
    export type Props = Omit<BaseCombobox.Input.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Label {
    export type Props = Omit<BaseCombobox.Label.Props, "className"> & {
      className?: string;
    };
  }
  export namespace InputGroup {
    export type Props = Omit<BaseCombobox.InputGroup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseCombobox.Trigger.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Icon {
    export type Props = Omit<BaseCombobox.Icon.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Clear {
    export type Props = Omit<BaseCombobox.Clear.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Portal {
    export type Props = BaseCombobox.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseCombobox.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseCombobox.Positioner.Props;
    export type State = BaseCombobox.Positioner.State;
  }
  export namespace Popup {
    export type Props = Omit<BaseCombobox.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseCombobox.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace List {
    export type Props = Omit<BaseCombobox.List.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Status {
    export type Props = Omit<BaseCombobox.Status.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Empty {
    export type Props = Omit<BaseCombobox.Empty.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Collection {
    export type Props = BaseCombobox.Collection.Props;
  }
  export namespace Row {
    export type Props = Omit<BaseCombobox.Row.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseCombobox.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseCombobox.Item.State;
  }
  export namespace ItemIndicator {
    export type Props = Omit<BaseCombobox.ItemIndicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = Omit<BaseCombobox.Group.Props, "className"> & {
      className?: string;
    };
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseCombobox.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Separator {
    export type Props = Omit<BaseCombobox.Separator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Value {
    export type Props = React.ComponentProps<typeof BaseCombobox.Value>;
  }
  export namespace Chips {
    export type Props = Omit<BaseCombobox.Chips.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Chip {
    export type Props = Omit<BaseCombobox.Chip.Props, "className"> & {
      className?: string;
    };
  }
  export namespace ChipRemove {
    export type Props = Omit<BaseCombobox.ChipRemove.Props, "className"> & {
      className?: string;
    };
  }
}

export default Combobox;

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
