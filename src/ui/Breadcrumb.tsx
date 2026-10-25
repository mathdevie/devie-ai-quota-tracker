// https://devie-ui.com/components/breadcrumb

import clsx from "clsx";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type React from "react";
import styles from "./Breadcrumb.module.scss";

function Root(props: Breadcrumb.Root.Props) {
  return <nav aria-label="breadcrumb" {...props} />;
}

function List({ className, ...props }: Breadcrumb.List.Props) {
  return <ol className={clsx(styles.list, className)} {...props} />;
}

function Item({ className, ...props }: Breadcrumb.Item.Props) {
  return <li className={clsx(styles.item, className)} {...props} />;
}

function Page({ className, ...props }: Breadcrumb.Page.Props) {
  return (
    <span
      aria-current="page"
      className={clsx(styles.span, className)}
      {...props}
    />
  );
}

function Separator({
  className,
  children,
  ...props
}: Breadcrumb.Separator.Props) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={clsx(styles.span, className)}
      {...props}
    >
      {children ?? <ChevronRight size={16} strokeWidth={1} />}
    </li>
  );
}

function Ellipsis({
  className,
  children,
  ...props
}: Breadcrumb.Ellipsis.Props) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={clsx(styles.span, className)}
      {...props}
    >
      {children ?? <MoreHorizontal size={16} strokeWidth={1} />}
    </span>
  );
}

const Breadcrumb = { Root, List, Item, Separator, Ellipsis, Page };

namespace Breadcrumb {
  export namespace Root {
    export type Props = React.ComponentProps<"nav">;
  }
  export namespace List {
    export type Props = React.ComponentProps<"ol">;
  }
  export namespace Item {
    export type Props = React.ComponentProps<"li">;
  }
  export namespace Page {
    export type Props = React.ComponentProps<"span">;
  }
  export namespace Separator {
    export type Props = React.ComponentProps<"li">;
  }
  export namespace Ellipsis {
    export type Props = React.ComponentProps<"span">;
  }
}

export default Breadcrumb;
