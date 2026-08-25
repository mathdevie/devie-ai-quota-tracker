// https://devie-ui.com/components/menu
// https://base-ui.com/react/components/menu

import { Menu as BaseMenu } from "@base-ui/react/menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import type React from "react";
import styles from "./Menu.module.scss";

const Root = BaseMenu.Root;

function Trigger({ className, ...props }: BaseMenu.Trigger.Props) {
  return (
    <BaseMenu.Trigger className={clsx(styles.trigger, className)} {...props} />
  );
}

const Portal = BaseMenu.Portal;

const Backdrop = BaseMenu.Backdrop;

function Positioner({ className, ...props }: BaseMenu.Positioner.Props) {
  return (
    <BaseMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseMenu.Popup.Props) {
  return (
    <BaseMenu.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Viewport({ className, ...props }: BaseMenu.Viewport.Props) {
  return (
    <BaseMenu.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: BaseMenu.Item.Props) {
  return <BaseMenu.Item className={clsx(styles.item, className)} {...props} />;
}

function LinkItem({ className, ...props }: BaseMenu.LinkItem.Props) {
  return (
    <BaseMenu.LinkItem className={clsx(styles.item, className)} {...props} />
  );
}

function Separator({ className, ...props }: BaseMenu.Separator.Props) {
  return (
    <BaseMenu.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: BaseMenu.Group.Props) {
  return (
    <BaseMenu.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: BaseMenu.GroupLabel.Props) {
  return (
    <BaseMenu.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function RadioGroup({ className, ...props }: BaseMenu.RadioGroup.Props) {
  return (
    <BaseMenu.RadioGroup
      className={clsx(styles.radioGroup, className)}
      {...props}
    />
  );
}

function RadioItem({ className, ...props }: BaseMenu.RadioItem.Props) {
  return (
    <BaseMenu.RadioItem
      className={clsx(styles.item, styles.radioItem, className)}
      {...props}
    />
  );
}

function RadioItemIndicator({
  className,
  children,
  ...props
}: BaseMenu.RadioItemIndicator.Props) {
  return (
    <BaseMenu.RadioItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Circle size={8} fill="currentColor" />}
    </BaseMenu.RadioItemIndicator>
  );
}

function CheckboxItem({ className, ...props }: BaseMenu.CheckboxItem.Props) {
  return (
    <BaseMenu.CheckboxItem
      className={clsx(styles.item, styles.checkboxItem, className)}
      {...props}
    />
  );
}

function CheckboxItemIndicator({
  className,
  children,
  ...props
}: BaseMenu.CheckboxItemIndicator.Props) {
  return (
    <BaseMenu.CheckboxItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseMenu.CheckboxItemIndicator>
  );
}

const SubmenuRoot = BaseMenu.SubmenuRoot;

function SubmenuTrigger({
  className,
  ...props
}: BaseMenu.SubmenuTrigger.Props) {
  return (
    <BaseMenu.SubmenuTrigger
      className={clsx(styles.item, styles.submenuTrigger, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseMenu.Arrow.Props) {
  return (
    <BaseMenu.Arrow className={clsx(styles.arrow, className)} {...props} />
  );
}

function SubmenuChevron({
  className,
  children,
  ...props
}: Menu.SubmenuChevron.Props) {
  return (
    <div className={clsx(styles.submenuChevron, className)} {...props}>
      {children || <ChevronRight size={16} />}
    </div>
  );
}

function Shortcut({ className, ...props }: Menu.Shortcut.Props) {
  return <kbd className={clsx(styles.shortcut, className)} {...props} />;
}

const Menu = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Viewport,
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

namespace Menu {
  export namespace Root {
    export type Props = BaseMenu.Root.Props;
    export type Actions = BaseMenu.Root.Actions;
  }
  export namespace Trigger {
    export type Props = BaseMenu.Trigger.Props;
    export type State = BaseMenu.Trigger.State;
  }
  export namespace Portal {
    export type Props = BaseMenu.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseMenu.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseMenu.Positioner.Props;
    export type State = BaseMenu.Positioner.State;
  }
  export namespace Popup {
    export type Props = BaseMenu.Popup.Props;
  }
  export namespace Viewport {
    export type Props = BaseMenu.Viewport.Props;
  }
  export namespace Item {
    export type Props = BaseMenu.Item.Props;
    export type State = BaseMenu.Item.State;
  }
  export namespace LinkItem {
    export type Props = BaseMenu.LinkItem.Props;
    export type State = BaseMenu.LinkItem.State;
  }
  export namespace Separator {
    export type Props = BaseMenu.Separator.Props;
  }
  export namespace Group {
    export type Props = BaseMenu.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseMenu.GroupLabel.Props;
  }
  export namespace RadioGroup {
    export type Props = BaseMenu.RadioGroup.Props;
    export type ChangeEventDetails = BaseMenu.RadioGroup.ChangeEventDetails;
  }
  export namespace RadioItem {
    export type Props = BaseMenu.RadioItem.Props;
    export type State = BaseMenu.RadioItem.State;
  }
  export namespace RadioItemIndicator {
    export type Props = BaseMenu.RadioItemIndicator.Props;
  }
  export namespace CheckboxItem {
    export type Props = BaseMenu.CheckboxItem.Props;
    export type State = BaseMenu.CheckboxItem.State;
  }
  export namespace CheckboxItemIndicator {
    export type Props = BaseMenu.CheckboxItemIndicator.Props;
  }
  export namespace SubmenuRoot {
    export type Props = BaseMenu.SubmenuRoot.Props;
  }
  export namespace SubmenuTrigger {
    export type Props = BaseMenu.SubmenuTrigger.Props;
    export type State = BaseMenu.SubmenuTrigger.State;
  }
  export namespace Arrow {
    export type Props = BaseMenu.Arrow.Props;
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

export default Menu;
