// https://devie-ui.com/components/layer-card

import clsx from "clsx";
import type React from "react";
import styles from "./LayerCard.module.scss";

function Root({ className, ...props }: LayerCard.Root.Props) {
  return <div className={clsx(styles.root, className)} {...props} />;
}

function Inner({ className, ...props }: LayerCard.Inner.Props) {
  return <div className={clsx(styles.inner, className)} {...props} />;
}

const LayerCard = {
  Root,
  Inner,
};

namespace LayerCard {
  export namespace Root {
    export type Props = React.ComponentProps<"div">;
  }
  export namespace Inner {
    export type Props = React.ComponentProps<"div">;
  }
}

export default LayerCard;
