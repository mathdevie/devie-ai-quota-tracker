// https://devie-ui.com/components/tabs
// https://base-ui.com/react/components/tabs

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import clsx from "clsx";
import styles from "./Tabs.module.scss";

const Root = BaseTabs.Root;

function List({ className, ...props }: BaseTabs.List.Props) {
  return <BaseTabs.List className={clsx(styles.list, className)} {...props} />;
}

const tabStyles = styles.tab;

function Tab({ className, ...props }: BaseTabs.Tab.Props) {
  return <BaseTabs.Tab className={clsx(tabStyles, className)} {...props} />;
}

function Indicator({ className, ...props }: BaseTabs.Indicator.Props) {
  return (
    <BaseTabs.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Panel({ className, ...props }: BaseTabs.Panel.Props) {
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
    export type Props = BaseTabs.List.Props;
  }
  export namespace Tab {
    export type Props = BaseTabs.Tab.Props;
    export type State = BaseTabs.Tab.State;
  }
  export namespace Indicator {
    export type Props = BaseTabs.Indicator.Props;
  }
  export namespace Panel {
    export type Props = BaseTabs.Panel.Props;
  }
}

export default Tabs;
