// https://devie-ui.com/components/layer-card

import clsx from "clsx";
import type React from "react";
import styles from "./LayerCard.module.scss";

function Root({ className, children, ...props }: LayerCard.Root.Props) {
  return (
    <div className={clsx(styles.root, className)} {...props}>
      {children}
    </div>
  );
}

function Inner({ className, children, ...props }: LayerCard.Inner.Props) {
  return (
    <div className={clsx(styles.inner, className)} {...props}>
      {children}
    </div>
  );
}

const LayerCard = {
  Root,
  Inner,
};

namespace LayerCard {
  export namespace Root {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Inner {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
}

export default LayerCard;
