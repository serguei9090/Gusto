import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<
    HTMLMotionProps<"button">,
    "onDrag" | "onDragEnd" | "onDragStart"
  > {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {isLoading ? <span className={styles.loader}>Loading...</span> : children}
    </motion.button>
  );
}
