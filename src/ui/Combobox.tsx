// https://devie-ui.com/components/combobox
// https://base-ui.com/react/components/combobox

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import clsx from "clsx";
import { Check, ChevronDown, X } from "lucide-react";
import type React from "react";
import styles from "./Combobox.module.scss";

const Root = BaseCombobox.Root;

function Label({ className, ...props }: BaseCombobox.Label.Props) {
  return (
    <BaseCombobox.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Input({ className, ...props }: BaseCombobox.Input.Props) {
  return (
    <BaseCombobox.Input className={clsx(styles.input, className)} {...props} />
  );
}

function InputGroup({ className, ...props }: BaseCombobox.InputGroup.Props) {
  return (
    <BaseCombobox.InputGroup
      className={clsx(styles.inputGroup, className)}
      {...props}
    />
  );
}

function Trigger({ className, render, ...props }: BaseCombobox.Trigger.Props) {
  return (
    <BaseCombobox.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseCombobox.Icon>) {
  return (
    <BaseCombobox.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseCombobox.Icon>
  );
}

function Clear({ className, children, ...props }: BaseCombobox.Clear.Props) {
  return (
    <BaseCombobox.Clear className={clsx(styles.clear, className)} {...props}>
      {children || <X size={16} />}
    </BaseCombobox.Clear>
  );
}

const Portal = BaseCombobox.Portal;

const Backdrop = BaseCombobox.Backdrop;

function Positioner({ className, ...props }: BaseCombobox.Positioner.Props) {
  return (
    <BaseCombobox.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseCombobox.Popup.Props) {
  return (
    <BaseCombobox.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Arrow({ className, ...props }: BaseCombobox.Arrow.Props) {
  return (
    <BaseCombobox.Arrow className={clsx(styles.arrow, className)} {...props} />
  );
}

function List({ className, ...props }: BaseCombobox.List.Props) {
  return (
    <BaseCombobox.List className={clsx(styles.list, className)} {...props} />
  );
}

function Empty({ className, ...props }: BaseCombobox.Empty.Props) {
  return (
    <BaseCombobox.Empty className={clsx(styles.empty, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseCombobox.Item.Props) {
  return (
    <BaseCombobox.Item className={clsx(styles.item, className)} {...props} />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: BaseCombobox.ItemIndicator.Props) {
  return (
    <BaseCombobox.ItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseCombobox.ItemIndicator>
  );
}

function Group({ className, ...props }: BaseCombobox.Group.Props) {
  return (
    <BaseCombobox.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: BaseCombobox.GroupLabel.Props) {
  return (
    <BaseCombobox.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: BaseCombobox.Separator.Props) {
  return (
    <BaseCombobox.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Value = BaseCombobox.Value;

function Chips({ className, ...props }: BaseCombobox.Chips.Props) {
  return (
    <BaseCombobox.Chips className={clsx(styles.chips, className)} {...props} />
  );
}

function Chip({ className, ...props }: BaseCombobox.Chip.Props) {
  return (
    <BaseCombobox.Chip className={clsx(styles.chip, className)} {...props} />
  );
}

function ChipRemove({
  className,
  children,
  ...props
}: BaseCombobox.ChipRemove.Props) {
  return (
    <BaseCombobox.ChipRemove
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
  Empty,
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
    export type Props = BaseCombobox.Input.Props;
  }
  export namespace Label {
    export type Props = BaseCombobox.Label.Props;
  }
  export namespace InputGroup {
    export type Props = BaseCombobox.InputGroup.Props;
  }
  export namespace Trigger {
    export type Props = BaseCombobox.Trigger.Props;
  }
  export namespace Icon {
    export type Props = React.ComponentProps<typeof BaseCombobox.Icon>;
  }
  export namespace Clear {
    export type Props = BaseCombobox.Clear.Props;
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
    export type Props = BaseCombobox.Popup.Props;
  }
  export namespace Arrow {
    export type Props = BaseCombobox.Arrow.Props;
  }
  export namespace List {
    export type Props = BaseCombobox.List.Props;
  }
  export namespace Empty {
    export type Props = BaseCombobox.Empty.Props;
  }
  export namespace Item {
    export type Props = BaseCombobox.Item.Props;
    export type State = BaseCombobox.Item.State;
  }
  export namespace ItemIndicator {
    export type Props = BaseCombobox.ItemIndicator.Props;
  }
  export namespace Group {
    export type Props = BaseCombobox.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseCombobox.GroupLabel.Props;
  }
  export namespace Separator {
    export type Props = BaseCombobox.Separator.Props;
  }
  export namespace Value {
    export type Props = React.ComponentProps<typeof BaseCombobox.Value>;
  }
  export namespace Chips {
    export type Props = BaseCombobox.Chips.Props;
  }
  export namespace Chip {
    export type Props = BaseCombobox.Chip.Props;
  }
  export namespace ChipRemove {
    export type Props = BaseCombobox.ChipRemove.Props;
  }
}

export default Combobox;
