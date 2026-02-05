import { forwardRef } from "react";
import { Label } from "../../atoms/Label";
import { Input, type InputProps } from "../../atoms/Input";
import styles from "./FormField.module.css";

export interface FormFieldProps extends InputProps {
    label: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, id, required, className, ...props }, ref) => {
        return (
            <div className={`${styles.wrapper} ${className || ""}`}>
                <Label htmlFor={id} required={required}>
                    {label}
                </Label>
                <Input id={id} ref={ref} fullWidth {...props} />
            </div>
        );
    }
);

FormField.displayName = "FormField";
