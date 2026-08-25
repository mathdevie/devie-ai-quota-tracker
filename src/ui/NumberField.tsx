// https://devie-ui.com/components/number-field
// https://base-ui.com/react/components/number-field

import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import styles from "./NumberField.module.scss";

function Root({ className, ...props }: BaseNumberField.Root.Props) {
  return (
    <BaseNumberField.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Group({ className, ...props }: BaseNumberField.Group.Props) {
  return (
    <BaseNumberField.Group
      className={clsx(styles.group, className)}
      {...props}
    />
  );
}

function Input({ className, ...props }: BaseNumberField.Input.Props) {
  return (
    <BaseNumberField.Input
      className={clsx(styles.input, className)}
      {...props}
    />
  );
}

function Increment({
  className,
  children,
  ...props
}: BaseNumberField.Increment.Props) {
  return (
    <BaseNumberField.Increment
      className={clsx(styles.increment, className)}
      {...props}
    >
      {children ?? <Plus size={16} />}
    </BaseNumberField.Increment>
  );
}

function Decrement({
  className,
  children,
  ...props
}: BaseNumberField.Decrement.Props) {
  return (
    <BaseNumberField.Decrement
      className={clsx(styles.decrement, className)}
      {...props}
    >
      {children ?? <Minus size={16} />}
    </BaseNumberField.Decrement>
  );
}

function ScrubArea({ className, ...props }: BaseNumberField.ScrubArea.Props) {
  return (
    <BaseNumberField.ScrubArea
      className={clsx(styles.scrubArea, className)}
      {...props}
    />
  );
}

function ScrubCursorIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="currentColor"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}

function ScrubAreaCursor({
  className,
  children,
  ...props
}: BaseNumberField.ScrubAreaCursor.Props) {
  return (
    <BaseNumberField.ScrubAreaCursor
      className={clsx(styles.scrubAreaCursor, className)}
      {...props}
    >
      {children ?? <ScrubCursorIcon />}
    </BaseNumberField.ScrubAreaCursor>
  );
}

const NumberField = {
  Root,
  Group,
  Input,
  Increment,
  Decrement,
  ScrubArea,
  ScrubAreaCursor,
};

namespace NumberField {
  export namespace Root {
    export type Props = BaseNumberField.Root.Props;
    export type State = BaseNumberField.Root.State;
    export type ChangeEventDetails = BaseNumberField.Root.ChangeEventDetails;
  }
  export namespace Group {
    export type Props = BaseNumberField.Group.Props;
  }
  export namespace Input {
    export type Props = BaseNumberField.Input.Props;
  }
  export namespace Increment {
    export type Props = BaseNumberField.Increment.Props;
  }
  export namespace Decrement {
    export type Props = BaseNumberField.Decrement.Props;
  }
  export namespace ScrubArea {
    export type Props = BaseNumberField.ScrubArea.Props;
  }
  export namespace ScrubAreaCursor {
    export type Props = BaseNumberField.ScrubAreaCursor.Props;
  }
}

export default NumberField;
