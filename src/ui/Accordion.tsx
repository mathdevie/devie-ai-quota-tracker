// https://devie-ui.com/components/accordion
// https://base-ui.com/react/components/accordion

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./Accordion.module.scss";

function Root({ className, ...props }: Accordion.Root.Props) {
  return (
    <BaseAccordion.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Item({ className, ...props }: Accordion.Item.Props) {
  return (
    <BaseAccordion.Item className={clsx(styles.item, className)} {...props} />
  );
}

function Header({ className, ...props }: Accordion.Header.Props) {
  return (
    <BaseAccordion.Header
      className={clsx(styles.header, className)}
      {...props}
    />
  );
}

function Trigger({ className, children, ...props }: Accordion.Trigger.Props) {
  return (
    <BaseAccordion.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    >
      {children}
      <ChevronDown className={styles.triggerIcon} />
    </BaseAccordion.Trigger>
  );
}

function Panel({ className, ...props }: Accordion.Panel.Props) {
  return (
    <BaseAccordion.Panel className={clsx(styles.panel, className)} {...props} />
  );
}

function Content({ className, ...props }: Accordion.Content.Props) {
  return <div className={clsx(styles.content, className)} {...props} />;
}

const Accordion = {
  Root,
  Item,
  Header,
  Trigger,
  Panel,
  Content,
};

namespace Accordion {
  export namespace Root {
    export type Props = Omit<BaseAccordion.Root.Props, "className"> & {
      className?: string;
    };
    export type State = BaseAccordion.Root.State;
  }
  export namespace Item {
    export type Props = Omit<BaseAccordion.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseAccordion.Item.State;
  }
  export namespace Header {
    export type Props = Omit<BaseAccordion.Header.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseAccordion.Trigger.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Panel {
    export type Props = Omit<BaseAccordion.Panel.Props, "className"> & {
      className?: string;
    };
    export type State = BaseAccordion.Panel.State;
  }
  export namespace Content {
    export type Props = React.ComponentProps<"div">;
  }
}

export default Accordion;
