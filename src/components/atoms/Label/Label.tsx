import type { LabelHTMLAttributes } from "react";
import styles from "./Label.module.css";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export function Label({ required, children, className, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Label wraps input via children usually
    <label className={`${styles.label} ${className || ""}`} {...props}>
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
}
