// https://devie-ui.com/components/button-group

import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./ButtonGroup.module.scss";

function ButtonGroup({ className, ...props }: ButtonGroup.Props) {
  return <fieldset className={clsx(styles.group, className)} {...props} />;
}

namespace ButtonGroup {
  export interface Props extends ComponentProps<"fieldset"> {
    className?: string;
  }
}

export default ButtonGroup;
