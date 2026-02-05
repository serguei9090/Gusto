import { Search } from "lucide-react";
import { Input, type InputProps } from "../../atoms/Input";
import styles from "./SearchBar.module.css";

export const SearchBar = ({ className, ...props }: InputProps) => {
    return (
        <div className={styles.wrapper}>
            <Search className={styles.icon} size={18} />
            <Input
                {...props}
                className={`${styles.input} ${className || ""}`}
                type="search"
                fullWidth
            />
        </div>
    );
};
