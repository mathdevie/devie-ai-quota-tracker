// https://devie-ui.com/components/badge

import { useRender } from "@base-ui/react/use-render";
import clsx from "clsx";
import styles from "./Badge.module.scss";

type BadgeVariant =
  | "primary"
  | "outline"
  | "danger"
  | "success"
  | "warning"
  | "literal-gray"
  | "literal-brown"
  | "literal-orange"
  | "literal-yellow"
  | "literal-green"
  | "literal-blue"
  | "literal-purple"
  | "literal-pink"
  | "literal-red";

const variantClassNames: Record<BadgeVariant, string> = {
  primary: styles.primary,
  outline: styles.outline,
  danger: styles.danger,
  success: styles.success,
  warning: styles.warning,
  "literal-gray": styles.literalGray,
  "literal-brown": styles.literalBrown,
  "literal-orange": styles.literalOrange,
  "literal-yellow": styles.literalYellow,
  "literal-green": styles.literalGreen,
  "literal-blue": styles.literalBlue,
  "literal-purple": styles.literalPurple,
  "literal-pink": styles.literalPink,
  "literal-red": styles.literalRed,
};

function Badge({
  variant = "outline",
  className,
  render,
  ...props
}: Badge.Props) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      className: clsx(styles.badge, variantClassNames[variant], className),
    },
  });
}

namespace Badge {
  export type Variant = BadgeVariant;
  export interface Props extends useRender.ComponentProps<"div"> {
    variant?: Variant;
  }
}

export default Badge;
