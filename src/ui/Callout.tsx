// https://devie-ui.com/components/callout

import clsx from "clsx";
import type React from "react";
import styles from "./Callout.module.scss";

type CalloutVariant = "success" | "danger" | "warning" | "primary" | "sub";

function Root({
  variant = "sub",
  children,
  className,
  ...props
}: Callout.Root.Props) {
  return (
    <div
      className={clsx(
        styles.container,
        variant === "success" && styles.variantSuccess,
        variant === "danger" && styles.variantDanger,
        variant === "warning" && styles.variantWarning,
        variant === "primary" && styles.variantPrimary,
        variant === "sub" && styles.variantSub,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Icon({ className, ...props }: Callout.Icon.Props) {
  return <div className={clsx(styles.icon, className)} {...props} />;
}

function Content({
  title,
  children,
  className,
  ...props
}: Callout.Content.Props) {
  return (
    <div className={clsx(styles.content, className)} {...props}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.text}>{children}</div>
    </div>
  );
}

const Callout = {
  Root,
  Icon,
  Content,
};

namespace Callout {
  export type Variant = CalloutVariant;
  export namespace Root {
    export interface Props extends React.ComponentProps<"div"> {
      variant?: Variant;
      children: React.ReactNode;
    }
  }
  export namespace Icon {
    export interface Props extends React.ComponentProps<"div"> {
      children: React.ReactElement;
    }
  }
  export namespace Content {
    export interface Props extends Omit<React.ComponentProps<"div">, "title"> {
      title?: React.ReactNode;
      children: React.ReactNode;
    }
  }
}

export default Callout;
