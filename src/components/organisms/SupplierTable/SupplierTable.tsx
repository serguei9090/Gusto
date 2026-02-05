import type { Supplier } from "@/types/ingredient.types";
import styles from "./SupplierTable.module.css";
import { Edit2, Trash2, Mail, Phone, MapPin } from "lucide-react";

interface SupplierTableProps {
    suppliers: Supplier[];
    onEdit: (supplier: Supplier) => void;
    onDelete: (id: number) => void;
}

export const SupplierTable = ({ suppliers, onEdit, onDelete }: SupplierTableProps) => {
    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Supplier Name</th>
                        <th className={styles.th}>Contact Person</th>
                        <th className={styles.th}>Contact Info</th>
                        <th className={styles.th}>Terms</th>
                        <th className={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map((supplier) => (
                        <tr key={supplier.id} className={styles.tr}>
                            <td className={styles.td}>
                                <div className={styles.name}>{supplier.name}</div>
                                {supplier.address && (
                                    <div className={styles.subInfo}>
                                        <MapPin size={12} /> {supplier.address}
                                    </div>
                                )}
                            </td>
                            <td className={styles.td}>{supplier.contactPerson || "-"}</td>
                            <td className={styles.td}>
                                <div className={styles.contactList}>
                                    {supplier.email && (
                                        <div className={styles.contactItem}>
                                            <Mail size={14} /> {supplier.email}
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className={styles.contactItem}>
                                            <Phone size={14} /> {supplier.phone}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className={styles.td}>
                                <span className={styles.terms}>{supplier.paymentTerms || "N/A"}</span>
                            </td>
                            <td className={styles.td}>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => onEdit(supplier)}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={() => onDelete(supplier.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
