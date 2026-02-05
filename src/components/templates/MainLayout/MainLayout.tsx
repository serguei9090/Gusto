import { Sidebar, type View } from "@/components/organisms/Sidebar";
import styles from "./MainLayout.module.css";

export interface MainLayoutProps {
    currentView: View;
    onChangeView: (view: View) => void;
    title?: string;
    children: React.ReactNode;
}

export const MainLayout = ({ currentView, onChangeView, title, children }: MainLayoutProps) => {
    return (
        <div className={styles.container}>
            <Sidebar currentView={currentView} onChangeView={onChangeView} />
            <main className={styles.main}>
                {title && <header className={styles.header}>{title}</header>}
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
};
