import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, fullWidth, className, ...props }, ref) => {
        return (
            <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ""}`}>
                <input
                    ref={ref}
                    className={`${styles.input} ${error ? styles.error : ""} ${className || ""}`}
                    {...props}
                />
                {error && <span className={styles.errorText}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";
