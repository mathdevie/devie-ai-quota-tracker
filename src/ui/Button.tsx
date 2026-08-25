// https://devie-ui.com/components/button
// https://base-ui.com/react/components/button

import { Button as BaseButton } from "@base-ui/react/button";
import clsx from "clsx";
import styles from "./Button.module.scss";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "naked"
  | "icon-primary"
  | "icon-secondary"
  | "icon-danger"
  | "icon-naked";

type Size = "sm" | "md" | "xl";

function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  isLoading,
  ...props
}: Button.Props) {
  return (
    <BaseButton
      className={clsx(
        styles.button,
        variant === "primary" && styles.variantPrimary,
        variant === "secondary" && styles.variantSecondary,
        variant === "danger" && styles.variantDanger,
        variant === "naked" && styles.variantNaked,
        variant === "icon-primary" && [styles.variantPrimary, styles.icon],
        variant === "icon-secondary" && [styles.variantSecondary, styles.icon],
        variant === "icon-danger" && [styles.variantDanger, styles.icon],
        variant === "icon-naked" && [styles.variantNaked, styles.icon],
        size === "sm" && styles.sizeSm,
        size === "md" && styles.sizeMd,
        size === "xl" && styles.sizeXl,
        className,
      )}
      data-loading={isLoading}
      disabled={disabled || isLoading}
      focusableWhenDisabled={isLoading}
      {...props}
    >
      {children}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loader} />
        </div>
      )}
    </BaseButton>
  );
}

namespace Button {
  export interface Props extends BaseButton.Props {
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
  }
  export type State = BaseButton.State;
}

export default Button;
