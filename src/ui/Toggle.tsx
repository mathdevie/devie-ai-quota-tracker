// https://devie-ui.com/components/toggle
// https://base-ui.com/react/components/toggle

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import clsx from "clsx";
import styles from "./Toggle.module.scss";

type Variant = "secondary" | "naked";

function Toggle({ className, variant = "secondary", ...props }: Toggle.Props) {
  return (
    <BaseToggle
      className={clsx(
        styles.toggle,
        variant === "secondary" && styles.variantSecondary,
        variant === "naked" && styles.variantNaked,
        className,
      )}
      {...props}
    />
  );
}

namespace Toggle {
  export interface Props extends BaseToggle.Props {
    variant?: Variant;
  }
  export type State = BaseToggle.State;
  export type ChangeEventDetails = BaseToggle.ChangeEventDetails;
}

export default Toggle;
