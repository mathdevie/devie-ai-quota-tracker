// https://devie-ui.com/components/menu
// https://base-ui.com/react/components/menu

import { Menu as BaseMenu } from "@base-ui/react/menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import type React from "react";
import styles from "./Menu.module.scss";

const Root = BaseMenu.Root;

const Trigger = BaseMenu.Trigger;

const Portal = BaseMenu.Portal;

const Backdrop = BaseMenu.Backdrop;

const Positioner = BaseMenu.Positioner;

function Popup({ className, ...props }: Menu.Popup.Props) {
  return (
    <BaseMenu.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Viewport({ className, ...props }: Menu.Viewport.Props) {
  return (
    <BaseMenu.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: Menu.Item.Props) {
  return <BaseMenu.Item className={clsx(styles.item, className)} {...props} />;
}

function LinkItem({ className, ...props }: Menu.LinkItem.Props) {
  return (
    <BaseMenu.LinkItem className={clsx(styles.item, className)} {...props} />
  );
}

function Separator({ className, ...props }: Menu.Separator.Props) {
  return (
    <BaseMenu.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Group = BaseMenu.Group;

function GroupLabel({ className, ...props }: Menu.GroupLabel.Props) {
  return (
    <BaseMenu.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

const RadioGroup = BaseMenu.RadioGroup;

function RadioItem({ className, ...props }: Menu.RadioItem.Props) {
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
}: Menu.RadioItemIndicator.Props) {
  return (
    <BaseMenu.RadioItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Circle size={8} fill="currentColor" />}
    </BaseMenu.RadioItemIndicator>
  );
}

function CheckboxItem({ className, ...props }: Menu.CheckboxItem.Props) {
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
}: Menu.CheckboxItemIndicator.Props) {
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

function SubmenuTrigger({ className, ...props }: Menu.SubmenuTrigger.Props) {
  return (
    <BaseMenu.SubmenuTrigger
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: Menu.Arrow.Props) {
  return (
    <BaseMenu.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseMenu.Arrow>
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
    export type Props = Omit<BaseMenu.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Viewport {
    export type Props = Omit<BaseMenu.Viewport.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseMenu.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.Item.State;
  }
  export namespace LinkItem {
    export type Props = Omit<BaseMenu.LinkItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.LinkItem.State;
  }
  export namespace Separator {
    export type Props = Omit<BaseMenu.Separator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = BaseMenu.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseMenu.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace RadioGroup {
    export type Props = BaseMenu.RadioGroup.Props;
    export type ChangeEventDetails = BaseMenu.RadioGroup.ChangeEventDetails;
  }
  export namespace RadioItem {
    export type Props = Omit<BaseMenu.RadioItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.RadioItem.State;
  }
  export namespace RadioItemIndicator {
    export type Props = Omit<BaseMenu.RadioItemIndicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace CheckboxItem {
    export type Props = Omit<BaseMenu.CheckboxItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.CheckboxItem.State;
  }
  export namespace CheckboxItemIndicator {
    export type Props = Omit<
      BaseMenu.CheckboxItemIndicator.Props,
      "className"
    > & {
      className?: string;
    };
  }
  export namespace SubmenuRoot {
    export type Props = BaseMenu.SubmenuRoot.Props;
  }
  export namespace SubmenuTrigger {
    export type Props = Omit<BaseMenu.SubmenuTrigger.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.SubmenuTrigger.State;
  }
  export namespace Arrow {
    export type Props = Omit<BaseMenu.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace SubmenuChevron {
    export type Props = React.ComponentProps<"div">;
  }
  export namespace Shortcut {
    export type Props = React.ComponentProps<"kbd">;
  }
}

export default Menu;

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="20"
      height="10"
      viewBox="0 0 20 10"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8V10H18.5349V8C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className={styles.arrowFill}
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9V8C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8V9C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className={styles.arrowInnerStroke}
      />
    </svg>
  );
}
