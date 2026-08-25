// https://devie-ui.com/components/autocomplete
// https://base-ui.com/react/components/autocomplete

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import type React from "react";
import styles from "./Autocomplete.module.scss";

const Root = BaseAutocomplete.Root;

const Value = BaseAutocomplete.Value;

function Input({ className, ...props }: BaseAutocomplete.Input.Props) {
  return (
    <BaseAutocomplete.Input
      className={clsx(styles.input, className)}
      {...props}
    />
  );
}

function InputGroup({
  className,
  ...props
}: BaseAutocomplete.InputGroup.Props) {
  return (
    <BaseAutocomplete.InputGroup
      className={clsx(styles.inputGroup, className)}
      {...props}
    />
  );
}

function Trigger({
  className,
  render,
  ...props
}: BaseAutocomplete.Trigger.Props) {
  return (
    <BaseAutocomplete.Trigger
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
}: React.ComponentProps<typeof BaseAutocomplete.Icon>) {
  return (
    <BaseAutocomplete.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseAutocomplete.Icon>
  );
}

function Clear({
  className,
  children,
  ...props
}: BaseAutocomplete.Clear.Props) {
  return (
    <BaseAutocomplete.Clear
      className={clsx(styles.clear, className)}
      {...props}
    >
      {children || <X size={16} />}
    </BaseAutocomplete.Clear>
  );
}

function List({ className, ...props }: BaseAutocomplete.List.Props) {
  return (
    <BaseAutocomplete.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

const Portal = BaseAutocomplete.Portal;

const Backdrop = BaseAutocomplete.Backdrop;

function Positioner({
  className,
  ...props
}: BaseAutocomplete.Positioner.Props) {
  return (
    <BaseAutocomplete.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseAutocomplete.Popup.Props) {
  return (
    <BaseAutocomplete.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseAutocomplete.Arrow.Props) {
  return (
    <BaseAutocomplete.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    />
  );
}

function Status({ className, ...props }: BaseAutocomplete.Status.Props) {
  return (
    <BaseAutocomplete.Status
      className={clsx(styles.status, className)}
      {...props}
    />
  );
}

function Empty({ className, ...props }: BaseAutocomplete.Empty.Props) {
  return (
    <BaseAutocomplete.Empty
      className={clsx(styles.empty, className)}
      {...props}
    />
  );
}

const Collection = BaseAutocomplete.Collection;

function Row({ className, ...props }: BaseAutocomplete.Row.Props) {
  return (
    <BaseAutocomplete.Row className={clsx(styles.row, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseAutocomplete.Item.Props) {
  return (
    <BaseAutocomplete.Item
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: BaseAutocomplete.Group.Props) {
  return (
    <BaseAutocomplete.Group
      className={clsx(styles.group, className)}
      {...props}
    />
  );
}

function GroupLabel({
  className,
  ...props
}: BaseAutocomplete.GroupLabel.Props) {
  return (
    <BaseAutocomplete.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: BaseAutocomplete.Separator.Props) {
  return (
    <BaseAutocomplete.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const useFilter = BaseAutocomplete.useFilter;

const Autocomplete = {
  Root,
  Value,
  Input,
  InputGroup,
  Trigger,
  Icon,
  Clear,
  List,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Arrow,
  Status,
  Empty,
  Collection,
  Row,
  Item,
  Group,
  GroupLabel,
  Separator,
  useFilter,
};

namespace Autocomplete {
  export namespace Root {
    export type Props<Value> = BaseAutocomplete.Root.Props<Value>;
    export type ChangeEventDetails = BaseAutocomplete.Root.ChangeEventDetails;
    export type ChangeEventReason = BaseAutocomplete.Root.ChangeEventReason;
  }
  export namespace Value {
    export type Props = BaseAutocomplete.Value.Props;
  }
  export namespace Input {
    export type Props = BaseAutocomplete.Input.Props;
  }
  export namespace InputGroup {
    export type Props = BaseAutocomplete.InputGroup.Props;
  }
  export namespace Trigger {
    export type Props = BaseAutocomplete.Trigger.Props;
  }
  export namespace Icon {
    export type Props = React.ComponentProps<typeof BaseAutocomplete.Icon>;
  }
  export namespace Clear {
    export type Props = BaseAutocomplete.Clear.Props;
  }
  export namespace List {
    export type Props = BaseAutocomplete.List.Props;
  }
  export namespace Portal {
    export type Props = BaseAutocomplete.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseAutocomplete.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseAutocomplete.Positioner.Props;
    export type State = BaseAutocomplete.Positioner.State;
  }
  export namespace Popup {
    export type Props = BaseAutocomplete.Popup.Props;
  }
  export namespace Arrow {
    export type Props = BaseAutocomplete.Arrow.Props;
  }
  export namespace Status {
    export type Props = BaseAutocomplete.Status.Props;
  }
  export namespace Empty {
    export type Props = BaseAutocomplete.Empty.Props;
  }
  export namespace Collection {
    export type Props = React.ComponentProps<
      typeof BaseAutocomplete.Collection
    >;
  }
  export namespace Row {
    export type Props = BaseAutocomplete.Row.Props;
  }
  export namespace Item {
    export type Props = BaseAutocomplete.Item.Props;
    export type State = BaseAutocomplete.Item.State;
  }
  export namespace Group {
    export type Props = BaseAutocomplete.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseAutocomplete.GroupLabel.Props;
  }
  export namespace Separator {
    export type Props = BaseAutocomplete.Separator.Props;
  }
}

export default Autocomplete;
