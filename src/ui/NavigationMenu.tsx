// https://devie-ui.com/components/navigation-menu
// https://base-ui.com/react/components/navigation-menu

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./NavigationMenu.module.scss";

const Root = BaseNavigationMenu.Root;

function List({
  className,
  ...props
}: React.ComponentProps<typeof BaseNavigationMenu.List>) {
  return (
    <BaseNavigationMenu.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: React.ComponentProps<typeof BaseNavigationMenu.Item>) {
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
}: React.ComponentProps<typeof BaseNavigationMenu.Trigger>) {
  return (
    <BaseNavigationMenu.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseNavigationMenu.Icon>) {
  return (
    <BaseNavigationMenu.Icon
      className={clsx(styles.icon, className)}
      {...props}
    >
      {children || <ChevronDown size={14} />}
    </BaseNavigationMenu.Icon>
  );
}

function Content({ className, ...props }: BaseNavigationMenu.Content.Props) {
  return (
    <BaseNavigationMenu.Content
      className={clsx(styles.content, className)}
      {...props}
    />
  );
}

function Link({ className, ...props }: BaseNavigationMenu.Link.Props) {
  return (
    <BaseNavigationMenu.Link
      className={clsx(styles.link, className)}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: BaseNavigationMenu.Backdrop.Props) {
  return (
    <BaseNavigationMenu.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

const Portal = BaseNavigationMenu.Portal;

function Positioner({
  className,
  ...props
}: BaseNavigationMenu.Positioner.Props) {
  return (
    <BaseNavigationMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseNavigationMenu.Popup.Props) {
  return (
    <BaseNavigationMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Viewport({ className, ...props }: BaseNavigationMenu.Viewport.Props) {
  return (
    <BaseNavigationMenu.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseNavigationMenu.Arrow.Props) {
  return (
    <BaseNavigationMenu.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    />
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
    export type Props = React.ComponentProps<typeof BaseNavigationMenu.List>;
  }
  export namespace Item {
    export type Props = React.ComponentProps<typeof BaseNavigationMenu.Item>;
  }
  export namespace Trigger {
    export type Props = React.ComponentProps<typeof BaseNavigationMenu.Trigger>;
  }
  export namespace Icon {
    export type Props = React.ComponentProps<typeof BaseNavigationMenu.Icon>;
  }
  export namespace Content {
    export type Props = BaseNavigationMenu.Content.Props;
  }
  export namespace Link {
    export type Props = BaseNavigationMenu.Link.Props;
  }
  export namespace Backdrop {
    export type Props = BaseNavigationMenu.Backdrop.Props;
  }
  export namespace Portal {
    export type Props = BaseNavigationMenu.Portal.Props;
  }
  export namespace Positioner {
    export type Props = BaseNavigationMenu.Positioner.Props;
  }
  export namespace Popup {
    export type Props = BaseNavigationMenu.Popup.Props;
  }
  export namespace Viewport {
    export type Props = BaseNavigationMenu.Viewport.Props;
  }
  export namespace Arrow {
    export type Props = BaseNavigationMenu.Arrow.Props;
  }
}

export default NavigationMenu;
