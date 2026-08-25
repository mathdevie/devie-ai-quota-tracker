// https://devie-ui.com/components/breadcrumb

import clsx from "clsx";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type React from "react";
import styles from "./Breadcrumb.module.scss";

const Root = ({ ...props }: React.ComponentProps<"nav">) => (
  <nav aria-label="breadcrumb" {...props} />
);

const List = ({ className, ...props }: Breadcrumb.List.Props) => (
  <ol className={clsx(styles.list, className)} {...props} />
);

const Item = ({ className, ...props }: Breadcrumb.Item.Props) => (
  <li className={clsx(styles.item, className)} {...props} />
);

const StyledSpan = ({ className, ...props }: Breadcrumb.Span.Props) => (
  <span className={clsx(styles.span, className)} {...props} />
);

const Page = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <StyledSpan aria-disabled="true" aria-current="page" {...props}>
    {children}
  </StyledSpan>
);

const Separator = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <StyledSpan role="presentation" aria-hidden="true" {...props}>
    {children ?? (
      <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={1} />
    )}
  </StyledSpan>
);

const Ellipsis = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <StyledSpan role="presentation" aria-hidden="true" {...props}>
    {children ?? (
      <MoreHorizontal style={{ width: 16, height: 16 }} strokeWidth={1} />
    )}
  </StyledSpan>
);

const Breadcrumb = { Root, List, Item, Separator, Ellipsis, Page };

namespace Breadcrumb {
  export namespace Root {
    export type Props = React.ComponentProps<"nav">;
  }
  export namespace List {
    export interface Props extends React.ComponentProps<"ol"> {
      className?: string;
    }
  }
  export namespace Item {
    export interface Props extends React.ComponentProps<"li"> {
      className?: string;
    }
  }
  export namespace Span {
    export interface Props extends React.ComponentPropsWithoutRef<"span"> {
      className?: string;
    }
  }
  export namespace Page {
    export type Props = React.ComponentPropsWithoutRef<"span">;
  }
  export namespace Separator {
    export type Props = React.ComponentPropsWithoutRef<"span">;
  }
  export namespace Ellipsis {
    export type Props = React.ComponentPropsWithoutRef<"span">;
  }
}

export default Breadcrumb;
