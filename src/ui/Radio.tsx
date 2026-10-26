// https://devie-ui.com/components/radio
// https://base-ui.com/react/components/radio

import { Radio as BaseRadio } from "@base-ui/react/radio";
import clsx from "clsx";
import styles from "./Radio.module.scss";

function Root({ className, ...props }: Radio.Root.Props) {
  return <BaseRadio.Root className={clsx(styles.root, className)} {...props} />;
}

function Indicator({ className, children, ...props }: Radio.Indicator.Props) {
  return (
    <BaseRadio.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    >
      {children || <DefaultIndicatorDot />}
    </BaseRadio.Indicator>
  );
}

function DefaultIndicatorDot() {
  return <div className={styles.dot} />;
}

const Radio = {
  Root,
  Indicator,
};

namespace Radio {
  export namespace Root {
    export type Props = Omit<BaseRadio.Root.Props, "className"> & {
      className?: string;
    };
    export type State = BaseRadio.Root.State;
  }
  export namespace Indicator {
    export type Props = Omit<BaseRadio.Indicator.Props, "className"> & {
      className?: string;
    };
  }
}

export default Radio;
