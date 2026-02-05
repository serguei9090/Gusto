import { forwardRef } from "react";
import { Input, type InputProps } from "../../atoms/Input";
import { Label } from "../../atoms/Label";
import styles from "./FormField.module.css";

export interface FormFieldProps extends Omit<InputProps, "children"> {
  label: string;
  children?: React.ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, id, required, className, children, ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${className || ""}`}>
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        {children ? (
          <div className={styles.childrenWrapper}>
            {children}
            {props.error && (
              <span className={styles.errorText}>{props.error}</span>
            )}
          </div>
        ) : (
          <Input id={id} ref={ref} fullWidth {...props} />
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";
