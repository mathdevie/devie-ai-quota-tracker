// https://devie-ui.com/components/badge

import clsx from "clsx";
import type React from "react";
import styles from "./Badge.module.scss";

type BadgeVariant =
  | "primary"
  | "outline"
  | "danger"
  | "success"
  | "warning"
  | "literalGray"
  | "literalBrown"
  | "literalOrange"
  | "literalYellow"
  | "literalGreen"
  | "literalBlue"
  | "literalPurple"
  | "literalPink"
  | "literalRed";

function Badge({
  variant = "outline",
  children,
  className,
  as = "div",
  ...props
}: Badge.Props) {
  // Badge.Props types the rendered element with div attributes, whatever tag `as` is
  const Component = as as React.ElementType<
    React.HTMLAttributes<HTMLDivElement>
  >;
  return (
    <Component
      className={clsx(styles.badge, styles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

namespace Badge {
  export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
    as?: React.ElementType;
  }
}

export default Badge;
