import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface SmartNumericInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
    value: number;
    onChange: (value: number) => void;
}

export const SmartNumericInput = ({ value, onChange, ...props }: SmartNumericInputProps) => {
    const [internalValue, setInternalValue] = useState<string>(value.toString());

    // Update internal value when external value changes as long as it's not what's already there
    useEffect(() => {
        const parsed = Number.parseFloat(internalValue);
        if (parsed !== value) {
            setInternalValue(value === 0 ? "" : value.toString());
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        // Allow empty, solely a minus sign, or numbers with a single decimal point
        if (val === "" || val === "-" || val === "." || /^-?\d*\.?\d*$/.test(val)) {
            setInternalValue(val);

            const parsed = Number.parseFloat(val);
            if (!Number.isNaN(parsed)) {
                onChange(parsed);
            } else {
                onChange(0);
            }
        }
    };

    const handleBlur = () => {
        // Clean up internal value on blur
        const parsed = Number.parseFloat(internalValue);
        if (Number.isNaN(parsed)) {
            setInternalValue("0");
        } else {
            setInternalValue(parsed.toString());
        }
    };

    return (
        <Input
            {...props}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
};
