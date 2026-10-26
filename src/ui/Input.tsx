// https://devie-ui.com/components/input
// https://base-ui.com/react/components/input

import { Input as BaseInput } from "@base-ui/react/input";
import clsx from "clsx";
import styles from "./Input.module.scss";

function Input({ className, ...props }: Input.Props) {
  return <BaseInput className={clsx(styles.input, className)} {...props} />;
}

namespace Input {
  export type Props = Omit<BaseInput.Props, "className"> & {
    className?: string;
  };
  export type State = BaseInput.State;
  export type ChangeEventDetails = BaseInput.ChangeEventDetails;
}

export default Input;
