// https://devie-ui.com/components/navigation-menu
// https://base-ui.com/react/components/navigation-menu

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./NavigationMenu.module.scss";

const Root = BaseNavigationMenu.Root;

function List({ className, ...props }: NavigationMenu.List.Props) {
  return (
    <BaseNavigationMenu.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: NavigationMenu.Item.Props) {
  return (
    <BaseNavigationMenu.Item
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Trigger({
  className,
  render,
  ...props
}: NavigationMenu.Trigger.Props) {
  return (
    <BaseNavigationMenu.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({ className, children, ...props }: NavigationMenu.Icon.Props) {
  return (
    <BaseNavigationMenu.Icon
      className={clsx(styles.icon, className)}
      {...props}
    >
      {children || <ChevronDown size={14} />}
    </BaseNavigationMenu.Icon>
  );
}

function Content({ className, ...props }: NavigationMenu.Content.Props) {
  return (
    <BaseNavigationMenu.Content
      className={clsx(styles.content, className)}
      {...props}
    />
  );
}

function Link({ className, ...props }: NavigationMenu.Link.Props) {
  return (
    <BaseNavigationMenu.Link
      className={clsx(styles.link, className)}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: NavigationMenu.Backdrop.Props) {
  return (
    <BaseNavigationMenu.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

const Portal = BaseNavigationMenu.Portal;

function Positioner({ className, ...props }: NavigationMenu.Positioner.Props) {
  return (
    <BaseNavigationMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: NavigationMenu.Popup.Props) {
  return (
    <BaseNavigationMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Viewport({ className, ...props }: NavigationMenu.Viewport.Props) {
  return (
    <BaseNavigationMenu.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: NavigationMenu.Arrow.Props) {
  return (
    <BaseNavigationMenu.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    >
      {children || <ArrowSvg />}
    </BaseNavigationMenu.Arrow>
  );
}

const NavigationMenu = {
  Root,
  List,
  Item,
  Trigger,
  Icon,
  Content,
  Link,
  Backdrop,
  Portal,
  Positioner,
  Popup,
  Viewport,
  Arrow,
};

namespace NavigationMenu {
  export namespace Root {
    export type Props = BaseNavigationMenu.Root.Props;
  }
  export namespace List {
    export type Props = Omit<BaseNavigationMenu.List.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseNavigationMenu.Item.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseNavigationMenu.Trigger.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Icon {
    export type Props = Omit<BaseNavigationMenu.Icon.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Content {
    export type Props = Omit<BaseNavigationMenu.Content.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Link {
    export type Props = Omit<BaseNavigationMenu.Link.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Backdrop {
    export type Props = Omit<BaseNavigationMenu.Backdrop.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Portal {
    export type Props = BaseNavigationMenu.Portal.Props;
  }
  export namespace Positioner {
    export type Props = Omit<
      BaseNavigationMenu.Positioner.Props,
      "className"
    > & { className?: string };
  }
  export namespace Popup {
    export type Props = Omit<BaseNavigationMenu.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Viewport {
    export type Props = Omit<BaseNavigationMenu.Viewport.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseNavigationMenu.Arrow.Props, "className"> & {
      className?: string;
    };
  }
}

export default NavigationMenu;

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
