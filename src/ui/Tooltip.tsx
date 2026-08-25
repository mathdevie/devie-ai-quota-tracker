// https://devie-ui.com/components/tooltip
// https://base-ui.com/react/components/tooltip

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import clsx from "clsx";
import styles from "./Tooltip.module.scss";

function Trigger({
  className,
  delay = 100,
  render,
  ...props
}: BaseTooltip.Trigger.Props) {
  return (
    <BaseTooltip.Trigger
      className={clsx(!render && styles.trigger, className)}
      delay={delay}
      render={render}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: BaseTooltip.Arrow.Props) {
  return (
    <BaseTooltip.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseTooltip.Arrow>
  );
}

function Popup({ className, ...props }: BaseTooltip.Popup.Props) {
  return (
    <BaseTooltip.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Provider({ delay = 100, ...props }: BaseTooltip.Provider.Props) {
  return <BaseTooltip.Provider delay={delay} {...props} />;
}

const Portal = BaseTooltip.Portal;

function Positioner({ className, ...props }: BaseTooltip.Positioner.Props) {
  return (
    <BaseTooltip.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

const Root = BaseTooltip.Root;

const Tooltip = {
  Provider,
  Root,
  Trigger,
  Popup,
  Arrow,
  Portal,
  Positioner,
};

namespace Tooltip {
  export namespace Provider {
    export type Props = BaseTooltip.Provider.Props;
  }
  export namespace Root {
    export type Props = BaseTooltip.Root.Props;
  }
  export namespace Trigger {
    export type Props = BaseTooltip.Trigger.Props;
  }
  export namespace Popup {
    export type Props = BaseTooltip.Popup.Props;
  }
  export namespace Arrow {
    export type Props = BaseTooltip.Arrow.Props;
  }
  export namespace Portal {
    export type Props = BaseTooltip.Portal.Props;
  }
  export namespace Positioner {
    export type Props = BaseTooltip.Positioner.Props;
    export type State = BaseTooltip.Positioner.State;
  }
}

export default Tooltip;

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <title>Tooltip arrow</title>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className={styles.arrowFill}
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className={styles.arrowInnerStroke}
      />
    </svg>
  );
}
