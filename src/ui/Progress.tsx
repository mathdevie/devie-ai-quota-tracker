// https://devie-ui.com/components/progress
// https://base-ui.com/react/components/progress

import { Progress as BaseProgress } from "@base-ui/react/progress";
import clsx from "clsx";
import styles from "./Progress.module.scss";

function Root({ className, children, ...props }: BaseProgress.Root.Props) {
  return (
    <BaseProgress.Root className={clsx(styles.root, className)} {...props}>
      {children}
    </BaseProgress.Root>
  );
}

function Track({ className, children, ...props }: BaseProgress.Track.Props) {
  return (
    <BaseProgress.Track className={clsx(styles.track, className)} {...props}>
      {children}
    </BaseProgress.Track>
  );
}

function Indicator({ className, ...props }: BaseProgress.Indicator.Props) {
  return (
    <BaseProgress.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Label({ className, children, ...props }: BaseProgress.Label.Props) {
  return (
    <BaseProgress.Label className={clsx(styles.label, className)} {...props}>
      {children}
    </BaseProgress.Label>
  );
}

function Value({ className, children, ...props }: BaseProgress.Value.Props) {
  return (
    <BaseProgress.Value className={clsx(styles.value, className)} {...props}>
      {children}
    </BaseProgress.Value>
  );
}

const Progress = {
  Root,
  Track,
  Indicator,
  Label,
  Value,
};

namespace Progress {
  export namespace Root {
    export type Props = BaseProgress.Root.Props;
    export type State = BaseProgress.Root.State;
  }
  export namespace Track {
    export type Props = BaseProgress.Track.Props;
  }
  export namespace Indicator {
    export type Props = BaseProgress.Indicator.Props;
  }
  export namespace Label {
    export type Props = BaseProgress.Label.Props;
  }
  export namespace Value {
    export type Props = BaseProgress.Value.Props;
  }
}

export default Progress;
