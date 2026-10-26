// https://devie-ui.com/components/button-group

import clsx from "clsx";
import type React from "react";
import styles from "./ButtonGroup.module.scss";

function ButtonGroup({ className, ...props }: ButtonGroup.Props) {
  return <fieldset className={clsx(styles.group, className)} {...props} />;
}

namespace ButtonGroup {
  export type Props = React.ComponentProps<"fieldset">;
}

export default ButtonGroup;
