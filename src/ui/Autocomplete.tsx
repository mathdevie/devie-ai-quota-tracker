// https://devie-ui.com/components/autocomplete
// https://base-ui.com/react/components/autocomplete

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import type React from "react";
import styles from "./Autocomplete.module.scss";

const Root = BaseAutocomplete.Root;

const Value = BaseAutocomplete.Value;

function Input({ className, ...props }: Autocomplete.Input.Props) {
  return (
    <BaseAutocomplete.Input
      className={clsx(styles.input, className)}
      {...props}
    />
  );
}

function InputGroup({ className, ...props }: Autocomplete.InputGroup.Props) {
  return (
    <BaseAutocomplete.InputGroup
      className={clsx(styles.inputGroup, className)}
      {...props}
    />
  );
}

function Trigger({ className, render, ...props }: Autocomplete.Trigger.Props) {
  return (
    <BaseAutocomplete.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({ className, children, ...props }: Autocomplete.Icon.Props) {
  return (
    <BaseAutocomplete.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseAutocomplete.Icon>
  );
}

function Clear({ className, children, ...props }: Autocomplete.Clear.Props) {
  return (
    <BaseAutocomplete.Clear
      aria-label={children ? undefined : "Clear"}
      className={clsx(styles.clear, className)}
      {...props}
    >
      {children || <X size={16} />}
    </BaseAutocomplete.Clear>
  );
}

function List({ className, ...props }: Autocomplete.List.Props) {
  return (
    <BaseAutocomplete.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

const Portal = BaseAutocomplete.Portal;

const Backdrop = BaseAutocomplete.Backdrop;

const Positioner = BaseAutocomplete.Positioner;

function Popup({ className, ...props }: Autocomplete.Popup.Props) {
  return (
    <BaseAutocomplete.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: Autocomplete.Arrow.Props) {
  return (
    <BaseAutocomplete.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    >
      {children || <ArrowSvg />}
    </BaseAutocomplete.Arrow>
  );
}

function Status({ className, ...props }: Autocomplete.Status.Props) {
  return (
    <BaseAutocomplete.Status
      className={clsx(styles.status, className)}
      {...props}
    />
  );
}

function Empty({ className, ...props }: Autocomplete.Empty.Props) {
  return (
    <BaseAutocomplete.Empty
      className={clsx(styles.empty, className)}
      {...props}
    />
  );
}

const Collection = BaseAutocomplete.Collection;

function Row({ className, ...props }: Autocomplete.Row.Props) {
  return (
    <BaseAutocomplete.Row className={clsx(styles.row, className)} {...props} />
  );
}

function Item({ className, ...props }: Autocomplete.Item.Props) {
  return (
    <BaseAutocomplete.Item
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: Autocomplete.Group.Props) {
  return (
    <BaseAutocomplete.Group
      className={clsx(styles.group, className)}
      {...props}
    />
  );
}

function GroupLabel({ className, ...props }: Autocomplete.GroupLabel.Props) {
  return (
    <BaseAutocomplete.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: Autocomplete.Separator.Props) {
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
    export type Props = Omit<BaseAutocomplete.Input.Props, "className"> & {
      className?: string;
    };
  }
  export namespace InputGroup {
    export type Props = Omit<BaseAutocomplete.InputGroup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseAutocomplete.Trigger.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Icon {
    export type Props = Omit<BaseAutocomplete.Icon.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Clear {
    export type Props = Omit<BaseAutocomplete.Clear.Props, "className"> & {
      className?: string;
    };
  }
  export namespace List {
    export type Props = Omit<BaseAutocomplete.List.Props, "className"> & {
      className?: string;
    };
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
    export type Props = Omit<BaseAutocomplete.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseAutocomplete.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Status {
    export type Props = Omit<BaseAutocomplete.Status.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Empty {
    export type Props = Omit<BaseAutocomplete.Empty.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Collection {
    export type Props = React.ComponentProps<
      typeof BaseAutocomplete.Collection
    >;
  }
  export namespace Row {
    export type Props = Omit<BaseAutocomplete.Row.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseAutocomplete.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseAutocomplete.Item.State;
  }
  export namespace Group {
    export type Props = Omit<BaseAutocomplete.Group.Props, "className"> & {
      className?: string;
    };
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseAutocomplete.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Separator {
    export type Props = Omit<BaseAutocomplete.Separator.Props, "className"> & {
      className?: string;
    };
  }
}

export default Autocomplete;

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
