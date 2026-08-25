// https://devie-ui.com/components/slider
// https://base-ui.com/react/components/slider

import { Slider as BaseSlider } from "@base-ui/react/slider";
import clsx from "clsx";
import styles from "./Slider.module.scss";

function Label({ className, ...props }: BaseSlider.Label.Props) {
  return (
    <BaseSlider.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Root({ className, ...props }: BaseSlider.Root.Props) {
  return (
    <BaseSlider.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Control({ className, ...props }: BaseSlider.Control.Props) {
  return (
    <BaseSlider.Control
      className={clsx(styles.control, className)}
      {...props}
    />
  );
}

function Track({ className, ...props }: BaseSlider.Track.Props) {
  return (
    <BaseSlider.Track className={clsx(styles.track, className)} {...props} />
  );
}

function Indicator({ className, ...props }: BaseSlider.Indicator.Props) {
  return (
    <BaseSlider.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Thumb({ className, ...props }: BaseSlider.Thumb.Props) {
  return (
    <BaseSlider.Thumb className={clsx(styles.thumb, className)} {...props} />
  );
}

function Value({ className, ...props }: BaseSlider.Value.Props) {
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
    export type Props = BaseSlider.Label.Props;
  }
  export namespace Root {
    export type Props = BaseSlider.Root.Props;
    export type State = BaseSlider.Root.State;
    export type ChangeEventDetails = BaseSlider.Root.ChangeEventDetails;
  }
  export namespace Control {
    export type Props = BaseSlider.Control.Props;
  }
  export namespace Track {
    export type Props = BaseSlider.Track.Props;
  }
  export namespace Indicator {
    export type Props = BaseSlider.Indicator.Props;
  }
  export namespace Thumb {
    export type Props = BaseSlider.Thumb.Props;
    export type State = BaseSlider.Thumb.State;
  }
  export namespace Value {
    export type Props = BaseSlider.Value.Props;
  }
}

export default Slider;
