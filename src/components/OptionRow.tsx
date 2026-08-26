import type { ReactNode } from "react";
import Switch from "@/ui/Switch";
import styles from "./OptionRow.module.scss";

/** A titled switch inside a dialog. Stack rows in `OptionRow.List`. */
function Row({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={styles.option}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <Switch.Root
        aria-label={label}
        checked={checked}
        onCheckedChange={onChange}
      >
        <Switch.Thumb />
      </Switch.Root>
    </div>
  );
}

function List({ children }: { children: ReactNode }) {
  return <div className={styles.options}>{children}</div>;
}

function Note({
  children,
  tone = "sub",
}: {
  children: ReactNode;
  tone?: "sub" | "danger";
}) {
  return (
    <p className={tone === "danger" ? styles.error : styles.status}>
      {children}
    </p>
  );
}

const OptionRow = { Row, List, Note };

export default OptionRow;
