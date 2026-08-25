// https://devie-ui.com/components/callout

"use client";

import clsx from "clsx";
import type React from "react";
import styles from "./Callout.module.scss";

type Variant = "success" | "danger" | "warning" | "primary" | "sub";

function Root({
  variant = "success",
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

function Icon({ children }: Callout.Icon.Props) {
  return <div className={styles.icon}>{children}</div>;
}

function Content({ title, children }: Callout.Content.Props) {
  return (
    <div className={styles.content}>
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
  export namespace Root {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      variant?: Variant;
      children: React.ReactNode;
    }
  }
  export namespace Icon {
    export interface Props {
      children: React.ReactElement;
    }
  }
  export namespace Content {
    export interface Props {
      title?: string;
      children: React.ReactNode;
    }
  }
}

export default Callout;
