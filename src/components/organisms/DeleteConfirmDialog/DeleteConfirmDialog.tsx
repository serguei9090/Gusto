import { Button } from "@/components/atoms/Button";
import styles from "./DeleteConfirmDialog.module.css";

export interface DeleteConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const DeleteConfirmDialog = ({
    isOpen,
    title = "Delete Item",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    onConfirm,
    onCancel,
    isLoading
}: DeleteConfirmDialogProps) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};
