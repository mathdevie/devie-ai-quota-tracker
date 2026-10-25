// https://devie-ui.com/components/switch
// https://base-ui.com/react/components/switch

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import clsx from "clsx";
import styles from "./Switch.module.scss";

function Root({ className, ...props }: Switch.Root.Props) {
  return (
    <BaseSwitch.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Thumb({ className, ...props }: Switch.Thumb.Props) {
  return (
    <BaseSwitch.Thumb className={clsx(styles.thumb, className)} {...props} />
  );
}

const Switch = {
  Root,
  Thumb,
};

namespace Switch {
  export namespace Root {
    export type Props = Omit<BaseSwitch.Root.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSwitch.Root.State;
    export type ChangeEventDetails = BaseSwitch.Root.ChangeEventDetails;
  }
  export namespace Thumb {
    export type Props = Omit<BaseSwitch.Thumb.Props, "className"> & {
      className?: string;
    };
  }
}

export default Switch;
