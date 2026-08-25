// https://devie-ui.com/components/context-menu
// https://base-ui.com/react/components/context-menu

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import type React from "react";
import styles from "./ContextMenu.module.scss";

const Root = BaseContextMenu.Root;

function Trigger({ className, ...props }: BaseContextMenu.Trigger.Props) {
  return (
    <BaseContextMenu.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

const Portal = BaseContextMenu.Portal;

const Backdrop = BaseContextMenu.Backdrop;

function Positioner({ className, ...props }: BaseContextMenu.Positioner.Props) {
  return (
    <BaseContextMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseContextMenu.Popup.Props) {
  return (
    <BaseContextMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: BaseContextMenu.Item.Props) {
  return (
    <BaseContextMenu.Item className={clsx(styles.item, className)} {...props} />
  );
}

function LinkItem({ className, ...props }: BaseContextMenu.LinkItem.Props) {
  return (
    <BaseContextMenu.LinkItem
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: BaseContextMenu.Separator.Props) {
  return (
    <BaseContextMenu.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: BaseContextMenu.Group.Props) {
  return (
    <BaseContextMenu.Group
      className={clsx(styles.group, className)}
      {...props}
    />
  );
}

function GroupLabel({ className, ...props }: BaseContextMenu.GroupLabel.Props) {
  return (
    <BaseContextMenu.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function RadioGroup({ className, ...props }: BaseContextMenu.RadioGroup.Props) {
  return (
    <BaseContextMenu.RadioGroup
      className={clsx(styles.radioGroup, className)}
      {...props}
    />
  );
}

function RadioItem({ className, ...props }: BaseContextMenu.RadioItem.Props) {
  return (
    <BaseContextMenu.RadioItem
      className={clsx(styles.item, styles.radioItem, className)}
      {...props}
    />
  );
}

function RadioItemIndicator({
  className,
  children,
  ...props
}: BaseContextMenu.RadioItemIndicator.Props) {
  return (
    <BaseContextMenu.RadioItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Circle size={8} fill="currentColor" />}
    </BaseContextMenu.RadioItemIndicator>
  );
}

function CheckboxItem({
  className,
  ...props
}: BaseContextMenu.CheckboxItem.Props) {
  return (
    <BaseContextMenu.CheckboxItem
      className={clsx(styles.item, styles.checkboxItem, className)}
      {...props}
    />
  );
}

function CheckboxItemIndicator({
  className,
  children,
  ...props
}: BaseContextMenu.CheckboxItemIndicator.Props) {
  return (
    <BaseContextMenu.CheckboxItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseContextMenu.CheckboxItemIndicator>
  );
}

const SubmenuRoot = BaseContextMenu.SubmenuRoot;

function SubmenuTrigger({
  className,
  ...props
}: BaseContextMenu.SubmenuTrigger.Props) {
  return (
    <BaseContextMenu.SubmenuTrigger
      className={clsx(styles.item, styles.submenuTrigger, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseContextMenu.Arrow.Props) {
  return (
    <BaseContextMenu.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    />
  );
}

function SubmenuChevron({
  className,
  children,
  ...props
}: ContextMenu.SubmenuChevron.Props) {
  return (
    <div className={clsx(styles.submenuChevron, className)} {...props}>
      {children || <ChevronRight size={16} />}
    </div>
  );
}

function Shortcut({ className, ...props }: ContextMenu.Shortcut.Props) {
  return <kbd className={clsx(styles.shortcut, className)} {...props} />;
}

const ContextMenu = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Arrow,
  Item,
  LinkItem,
  Separator,
  Group,
  GroupLabel,
  RadioGroup,
  RadioItem,
  RadioItemIndicator,
  CheckboxItem,
  CheckboxItemIndicator,
  SubmenuRoot,
  SubmenuTrigger,
  SubmenuChevron,
  Shortcut,
};

namespace ContextMenu {
  export namespace Root {
    export type Props = BaseContextMenu.Root.Props;
  }
  export namespace Trigger {
    export type Props = BaseContextMenu.Trigger.Props;
  }
  export namespace Portal {
    export type Props = BaseContextMenu.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseContextMenu.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseContextMenu.Positioner.Props;
    export type State = BaseContextMenu.Positioner.State;
  }
  export namespace Popup {
    export type Props = BaseContextMenu.Popup.Props;
  }
  export namespace Item {
    export type Props = BaseContextMenu.Item.Props;
    export type State = BaseContextMenu.Item.State;
  }
  export namespace LinkItem {
    export type Props = BaseContextMenu.LinkItem.Props;
    export type State = BaseContextMenu.LinkItem.State;
  }
  export namespace Separator {
    export type Props = BaseContextMenu.Separator.Props;
  }
  export namespace Group {
    export type Props = BaseContextMenu.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseContextMenu.GroupLabel.Props;
  }
  export namespace RadioGroup {
    export type Props = BaseContextMenu.RadioGroup.Props;
    export type ChangeEventDetails =
      BaseContextMenu.RadioGroup.ChangeEventDetails;
  }
  export namespace RadioItem {
    export type Props = BaseContextMenu.RadioItem.Props;
    export type State = BaseContextMenu.RadioItem.State;
  }
  export namespace RadioItemIndicator {
    export type Props = BaseContextMenu.RadioItemIndicator.Props;
  }
  export namespace CheckboxItem {
    export type Props = BaseContextMenu.CheckboxItem.Props;
    export type State = BaseContextMenu.CheckboxItem.State;
  }
  export namespace CheckboxItemIndicator {
    export type Props = BaseContextMenu.CheckboxItemIndicator.Props;
  }
  export namespace SubmenuRoot {
    export type Props = BaseContextMenu.SubmenuRoot.Props;
  }
  export namespace SubmenuTrigger {
    export type Props = BaseContextMenu.SubmenuTrigger.Props;
    export type State = BaseContextMenu.SubmenuTrigger.State;
  }
  export namespace Arrow {
    export type Props = BaseContextMenu.Arrow.Props;
  }
  export namespace SubmenuChevron {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
      children?: React.ReactNode;
    }
  }
  export namespace Shortcut {
    export interface Props extends React.HTMLAttributes<HTMLElement> {
      className?: string;
    }
  }
}

export default ContextMenu;
