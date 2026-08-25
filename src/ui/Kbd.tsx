// https://devie-ui.com/components/kbd

import clsx from "clsx";
import type React from "react";
import styles from "./Kbd.module.scss";

function Root({ className, variant = "badge", ...props }: Kbd.Root.Props) {
  return (
    <kbd
      className={clsx(
        styles.root,
        variant === "naked" ? styles.naked : styles.badge,
        className,
      )}
      {...props}
    />
  );
}

function Group({ className, ...props }: Kbd.Group.Props) {
  return <kbd className={clsx(styles.group, className)} {...props} />;
}

const Kbd = {
  Root,
  Group,
};

namespace Kbd {
  export namespace Root {
    export type Variant = "badge" | "naked";

    export interface Props extends React.HTMLAttributes<HTMLElement> {
      className?: string;
      variant?: Variant;
    }
  }
  export namespace Group {
    export interface Props extends React.HTMLAttributes<HTMLElement> {
      className?: string;
    }
  }
}

export default Kbd;
