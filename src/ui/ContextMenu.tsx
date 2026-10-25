// https://devie-ui.com/components/context-menu
// https://base-ui.com/react/components/context-menu

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import type React from "react";
import styles from "./ContextMenu.module.scss";

const Root = BaseContextMenu.Root;

const Trigger = BaseContextMenu.Trigger;

const Portal = BaseContextMenu.Portal;

const Backdrop = BaseContextMenu.Backdrop;

const Positioner = BaseContextMenu.Positioner;

function Popup({ className, ...props }: ContextMenu.Popup.Props) {
  return (
    <BaseContextMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: ContextMenu.Item.Props) {
  return (
    <BaseContextMenu.Item className={clsx(styles.item, className)} {...props} />
  );
}

function LinkItem({ className, ...props }: ContextMenu.LinkItem.Props) {
  return (
    <BaseContextMenu.LinkItem
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: ContextMenu.Separator.Props) {
  return (
    <BaseContextMenu.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Group = BaseContextMenu.Group;

function GroupLabel({ className, ...props }: ContextMenu.GroupLabel.Props) {
  return (
    <BaseContextMenu.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

const RadioGroup = BaseContextMenu.RadioGroup;

function RadioItem({ className, ...props }: ContextMenu.RadioItem.Props) {
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
}: ContextMenu.RadioItemIndicator.Props) {
  return (
    <BaseContextMenu.RadioItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Circle size={8} fill="currentColor" />}
    </BaseContextMenu.RadioItemIndicator>
  );
}

function CheckboxItem({ className, ...props }: ContextMenu.CheckboxItem.Props) {
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
}: ContextMenu.CheckboxItemIndicator.Props) {
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
}: ContextMenu.SubmenuTrigger.Props) {
  return (
    <BaseContextMenu.SubmenuTrigger
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: ContextMenu.Arrow.Props) {
  return (
    <BaseContextMenu.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseContextMenu.Arrow>
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
    export type Actions = BaseContextMenu.Root.Actions;
  }
  export namespace Trigger {
    export type Props = BaseContextMenu.Trigger.Props;
    export type State = BaseContextMenu.Trigger.State;
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
    export type Props = Omit<BaseContextMenu.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseContextMenu.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseContextMenu.Item.State;
  }
  export namespace LinkItem {
    export type Props = Omit<BaseContextMenu.LinkItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseContextMenu.LinkItem.State;
  }
  export namespace Separator {
    export type Props = Omit<BaseContextMenu.Separator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = BaseContextMenu.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseContextMenu.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace RadioGroup {
    export type Props = BaseContextMenu.RadioGroup.Props;
    export type ChangeEventDetails =
      BaseContextMenu.RadioGroup.ChangeEventDetails;
  }
  export namespace RadioItem {
    export type Props = Omit<BaseContextMenu.RadioItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseContextMenu.RadioItem.State;
  }
  export namespace RadioItemIndicator {
    export type Props = Omit<
      BaseContextMenu.RadioItemIndicator.Props,
      "className"
    > & { className?: string };
  }
  export namespace CheckboxItem {
    export type Props = Omit<
      BaseContextMenu.CheckboxItem.Props,
      "className"
    > & { className?: string };
    export type State = BaseContextMenu.CheckboxItem.State;
  }
  export namespace CheckboxItemIndicator {
    export type Props = Omit<
      BaseContextMenu.CheckboxItemIndicator.Props,
      "className"
    > & { className?: string };
  }
  export namespace SubmenuRoot {
    export type Props = BaseContextMenu.SubmenuRoot.Props;
  }
  export namespace SubmenuTrigger {
    export type Props = Omit<
      BaseContextMenu.SubmenuTrigger.Props,
      "className"
    > & { className?: string };
    export type State = BaseContextMenu.SubmenuTrigger.State;
  }
  export namespace Arrow {
    export type Props = Omit<BaseContextMenu.Arrow.Props, "className"> & {
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

export default ContextMenu;

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
