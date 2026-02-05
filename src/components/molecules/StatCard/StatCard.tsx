import styles from "./StatCard.module.css";

export interface StatCardProps {
    label: string;
    value: string | number;
}

export const StatCard = ({ label, value }: StatCardProps) => {
    return (
        <div className={styles.card}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value}</span>
        </div>
    );
};
