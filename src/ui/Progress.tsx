// https://devie-ui.com/components/progress
// https://base-ui.com/react/components/progress

import { Progress as BaseProgress } from "@base-ui/react/progress";
import clsx from "clsx";
import styles from "./Progress.module.scss";

function Root({ className, ...props }: Progress.Root.Props) {
  return (
    <BaseProgress.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Track({ className, ...props }: Progress.Track.Props) {
  return (
    <BaseProgress.Track className={clsx(styles.track, className)} {...props} />
  );
}

function Indicator({ className, ...props }: Progress.Indicator.Props) {
  return (
    <BaseProgress.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Label({ className, ...props }: Progress.Label.Props) {
  return (
    <BaseProgress.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Value({ className, ...props }: Progress.Value.Props) {
  return (
    <BaseProgress.Value className={clsx(styles.value, className)} {...props} />
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
    export type Props = Omit<BaseProgress.Root.Props, "className"> & {
      className?: string;
    };
    export type State = BaseProgress.Root.State;
  }
  export namespace Track {
    export type Props = Omit<BaseProgress.Track.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Indicator {
    export type Props = Omit<BaseProgress.Indicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Label {
    export type Props = Omit<BaseProgress.Label.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Value {
    export type Props = Omit<BaseProgress.Value.Props, "className"> & {
      className?: string;
    };
  }
}

export default Progress;
