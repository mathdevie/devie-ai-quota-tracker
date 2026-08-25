// https://devie-ui.com/components/checkbox-group
// https://base-ui.com/react/components/checkbox-group

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import clsx from "clsx";
import styles from "./CheckboxGroup.module.scss";

function Root({ className, ...props }: BaseCheckboxGroup.Props) {
  return (
    <BaseCheckboxGroup className={clsx(styles.root, className)} {...props} />
  );
}

const CheckboxGroup = {
  Root,
};

namespace CheckboxGroup {
  export namespace Root {
    export type Props = BaseCheckboxGroup.Props;
    export type State = BaseCheckboxGroup.State;
    export type ChangeEventDetails = BaseCheckboxGroup.ChangeEventDetails;
  }
}

export default CheckboxGroup;
