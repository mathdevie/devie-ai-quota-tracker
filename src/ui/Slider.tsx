// https://devie-ui.com/components/slider
// https://base-ui.com/react/components/slider

import { Slider as BaseSlider } from "@base-ui/react/slider";
import clsx from "clsx";
import styles from "./Slider.module.scss";

function Label({ className, ...props }: Slider.Label.Props) {
  return (
    <BaseSlider.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Root({ className, ...props }: Slider.Root.Props) {
  return (
    <BaseSlider.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Control({ className, ...props }: Slider.Control.Props) {
  return (
    <BaseSlider.Control
      className={clsx(styles.control, className)}
      {...props}
    />
  );
}

function Track({ className, ...props }: Slider.Track.Props) {
  return (
    <BaseSlider.Track className={clsx(styles.track, className)} {...props} />
  );
}

function Indicator({ className, ...props }: Slider.Indicator.Props) {
  return (
    <BaseSlider.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Thumb({ className, ...props }: Slider.Thumb.Props) {
  return (
    <BaseSlider.Thumb className={clsx(styles.thumb, className)} {...props} />
  );
}

function Value({ className, ...props }: Slider.Value.Props) {
  return (
    <BaseSlider.Value className={clsx(styles.value, className)} {...props} />
  );
}

const Slider = {
  Label,
  Root,
  Control,
  Track,
  Indicator,
  Thumb,
  Value,
};

namespace Slider {
  export namespace Label {
    export type Props = Omit<BaseSlider.Label.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Root {
    export type Props = Omit<BaseSlider.Root.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSlider.Root.State;
    export type ChangeEventDetails = BaseSlider.Root.ChangeEventDetails;
  }
  export namespace Control {
    export type Props = Omit<BaseSlider.Control.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Track {
    export type Props = Omit<BaseSlider.Track.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Indicator {
    export type Props = Omit<BaseSlider.Indicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Thumb {
    export type Props = Omit<BaseSlider.Thumb.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSlider.Thumb.State;
  }
  export namespace Value {
    export type Props = Omit<BaseSlider.Value.Props, "className"> & {
      className?: string;
    };
  }
}

export default Slider;
