// https://devie-ui.com/components/input-group

import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./InputGroup.module.scss";

function Root({ className, ...props }: InputGroup.Root.Props) {
  return <div className={clsx(styles.root, className)} {...props} />;
}

function Addon({ className, ...props }: InputGroup.Addon.Props) {
  return <span className={clsx(styles.addon, className)} {...props} />;
}

const InputGroup = {
  Root,
  Addon,
};

namespace InputGroup {
  export namespace Root {
    export interface Props extends ComponentProps<"div"> {
      className?: string;
    }
  }
  export namespace Addon {
    export interface Props extends ComponentProps<"span"> {
      className?: string;
    }
  }
}

export default InputGroup;
