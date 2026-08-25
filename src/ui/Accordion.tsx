// https://devie-ui.com/components/accordion
// https://base-ui.com/react/components/accordion

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Accordion.module.scss";

function Root({ className, ...props }: BaseAccordion.Root.Props) {
  return (
    <BaseAccordion.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseAccordion.Item.Props) {
  return (
    <BaseAccordion.Item className={clsx(styles.item, className)} {...props} />
  );
}

function Header({ className, ...props }: BaseAccordion.Header.Props) {
  return (
    <BaseAccordion.Header
      className={clsx(styles.header, className)}
      {...props}
    />
  );
}

function Trigger({
  className,
  children,
  ...props
}: BaseAccordion.Trigger.Props) {
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

function Panel({ className, ...props }: BaseAccordion.Panel.Props) {
  return (
    <BaseAccordion.Panel className={clsx(styles.panel, className)} {...props} />
  );
}

function Content({ className, children }: Accordion.Content.Props) {
  return <div className={clsx(styles.content, className)}>{children}</div>;
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
    export type Props = BaseAccordion.Root.Props;
    export type State = BaseAccordion.Root.State;
  }
  export namespace Item {
    export type Props = BaseAccordion.Item.Props;
    export type State = BaseAccordion.Item.State;
  }
  export namespace Header {
    export type Props = BaseAccordion.Header.Props;
  }
  export namespace Trigger {
    export type Props = BaseAccordion.Trigger.Props;
  }
  export namespace Panel {
    export type Props = BaseAccordion.Panel.Props;
    export type State = BaseAccordion.Panel.State;
  }
  export namespace Content {
    export interface Props {
      className?: string;
      children?: ReactNode;
    }
  }
}

export default Accordion;
