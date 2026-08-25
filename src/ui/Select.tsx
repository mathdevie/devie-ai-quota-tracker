// https://devie-ui.com/components/select
// https://base-ui.com/react/components/select

import { Select as BaseSelect } from "@base-ui/react/select";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./Select.module.scss";

const Root = BaseSelect.Root;

function Label({ className, ...props }: BaseSelect.Label.Props) {
  return (
    <BaseSelect.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Trigger({ className, ...props }: BaseSelect.Trigger.Props) {
  return (
    <BaseSelect.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

function Value({ className, ...props }: BaseSelect.Value.Props) {
  return (
    <BaseSelect.Value className={clsx(styles.value, className)} {...props} />
  );
}

function Icon({ className, children, ...props }: BaseSelect.Icon.Props) {
  return (
    <BaseSelect.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseSelect.Icon>
  );
}

const Portal = BaseSelect.Portal;

function Positioner({ className, ...props }: BaseSelect.Positioner.Props) {
  return (
    <BaseSelect.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseSelect.Popup.Props) {
  return (
    <BaseSelect.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function List({ className, ...props }: BaseSelect.List.Props) {
  return (
    <BaseSelect.List className={clsx(styles.list, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseSelect.Item.Props) {
  return (
    <BaseSelect.Item className={clsx(styles.item, className)} {...props} />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: BaseSelect.ItemIndicator.Props) {
  return (
    <BaseSelect.ItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseSelect.ItemIndicator>
  );
}

function ItemText({ className, ...props }: BaseSelect.ItemText.Props) {
  return (
    <BaseSelect.ItemText
      className={clsx(styles.itemText, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseSelect.Arrow.Props) {
  return (
    <BaseSelect.Arrow className={clsx(styles.arrow, className)} {...props} />
  );
}

function ScrollUpArrow({
  className,
  ...props
}: BaseSelect.ScrollUpArrow.Props) {
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
}: BaseSelect.ScrollDownArrow.Props) {
  return (
    <BaseSelect.ScrollDownArrow
      className={clsx(styles.scrollArrow, className)}
      {...props}
    />
  );
}

const Backdrop = BaseSelect.Backdrop;

function Group({ className, ...props }: BaseSelect.Group.Props) {
  return (
    <BaseSelect.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: BaseSelect.GroupLabel.Props) {
  return (
    <BaseSelect.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: BaseSelect.Separator.Props) {
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
    export type Props = BaseSelect.Label.Props;
  }
  export namespace Trigger {
    export type Props = BaseSelect.Trigger.Props;
    export type State = BaseSelect.Trigger.State;
  }
  export namespace Value {
    export type Props = React.ComponentProps<typeof BaseSelect.Value>;
  }
  export namespace Icon {
    export type Props = BaseSelect.Icon.Props;
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
    export type Props = BaseSelect.Popup.Props;
  }
  export namespace List {
    export type Props = BaseSelect.List.Props;
  }
  export namespace Arrow {
    export type Props = BaseSelect.Arrow.Props;
  }
  export namespace ScrollUpArrow {
    export type Props = BaseSelect.ScrollUpArrow.Props;
  }
  export namespace ScrollDownArrow {
    export type Props = BaseSelect.ScrollDownArrow.Props;
  }
  export namespace Item {
    export type Props = BaseSelect.Item.Props;
    export type State = BaseSelect.Item.State;
  }
  export namespace ItemIndicator {
    export type Props = BaseSelect.ItemIndicator.Props;
  }
  export namespace ItemText {
    export type Props = BaseSelect.ItemText.Props;
  }
  export namespace Group {
    export type Props = BaseSelect.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseSelect.GroupLabel.Props;
  }
  export namespace Separator {
    export type Props = BaseSelect.Separator.Props;
  }
}

export default Select;
