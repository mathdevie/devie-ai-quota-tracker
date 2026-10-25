// https://devie-ui.com/components/checkbox-group
// https://base-ui.com/react/components/checkbox-group

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import clsx from "clsx";
import styles from "./CheckboxGroup.module.scss";

function CheckboxGroup({ className, ...props }: CheckboxGroup.Props) {
  return (
    <BaseCheckboxGroup className={clsx(styles.root, className)} {...props} />
  );
}

namespace CheckboxGroup {
  export type Props = Omit<BaseCheckboxGroup.Props, "className"> & {
    className?: string;
  };
  export type State = BaseCheckboxGroup.State;
  export type ChangeEventDetails = BaseCheckboxGroup.ChangeEventDetails;
}

export default CheckboxGroup;
