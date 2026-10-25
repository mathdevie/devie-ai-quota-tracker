// https://devie-ui.com/components/tabs
// https://base-ui.com/react/components/tabs

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import clsx from "clsx";
import styles from "./Tabs.module.scss";

const Root = BaseTabs.Root;

function List({ className, variant = "underline", ...props }: Tabs.List.Props) {
  return (
    <BaseTabs.List
      className={clsx(
        styles.list,
        variant === "segmented" && styles.listSegmented,
        className,
      )}
      {...props}
    />
  );
}

function Tab({ className, ...props }: Tabs.Tab.Props) {
  return <BaseTabs.Tab className={clsx(styles.tab, className)} {...props} />;
}

function Indicator({ className, ...props }: Tabs.Indicator.Props) {
  return (
    <BaseTabs.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Panel({ className, ...props }: Tabs.Panel.Props) {
  return (
    <BaseTabs.Panel className={clsx(styles.panel, className)} {...props} />
  );
}

const Tabs = {
  Root,
  List,
  Tab,
  Indicator,
  Panel,
};

namespace Tabs {
  export namespace Root {
    export type Props = BaseTabs.Root.Props;
    export type ChangeEventDetails = BaseTabs.Root.ChangeEventDetails;
  }
  export namespace List {
    export type Variant = "underline" | "segmented";
    export interface Props extends Omit<BaseTabs.List.Props, "className"> {
      className?: string;
      variant?: Variant;
    }
  }
  export namespace Tab {
    export type Props = Omit<BaseTabs.Tab.Props, "className"> & {
      className?: string;
    };
    export type State = BaseTabs.Tab.State;
  }
  export namespace Indicator {
    export type Props = Omit<BaseTabs.Indicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Panel {
    export type Props = Omit<BaseTabs.Panel.Props, "className"> & {
      className?: string;
    };
  }
}

export default Tabs;
