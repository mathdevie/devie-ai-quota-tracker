// https://devie-ui.com/components/checkbox
// https://base-ui.com/react/components/checkbox

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import styles from "./Checkbox.module.scss";

function Root({ className, ...props }: BaseCheckbox.Root.Props) {
  return (
    <BaseCheckbox.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Indicator({
  className,
  children,
  ...props
}: BaseCheckbox.Indicator.Props) {
  return (
    <BaseCheckbox.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    >
      {children || (
        <>
          <Check
            className={clsx(styles.icon, styles.checkIcon)}
            strokeWidth={2.5}
          />
          <Minus
            className={clsx(styles.icon, styles.indeterminateIcon)}
            strokeWidth={2.5}
          />
        </>
      )}
    </BaseCheckbox.Indicator>
  );
}

const Checkbox = {
  Root,
  Indicator,
};

namespace Checkbox {
  export namespace Root {
    export type Props = BaseCheckbox.Root.Props;
    export type State = BaseCheckbox.Root.State;
    export type ChangeEventDetails = BaseCheckbox.Root.ChangeEventDetails;
  }
  export namespace Indicator {
    export type Props = BaseCheckbox.Indicator.Props;
  }
}

export default Checkbox;
