// https://devie-ui.com/components/radio-group
// https://base-ui.com/react/components/radio-group

import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import clsx from "clsx";
import styles from "./RadioGroup.module.scss";

function RadioGroup({ className, ...props }: BaseRadioGroup.Props) {
  return <BaseRadioGroup className={clsx(styles.root, className)} {...props} />;
}

namespace RadioGroup {
  export type Props = BaseRadioGroup.Props;
  export type State = BaseRadioGroup.State;
  export type ChangeEventDetails = BaseRadioGroup.ChangeEventDetails;
}

export default RadioGroup;
