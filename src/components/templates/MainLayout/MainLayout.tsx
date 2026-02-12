import { MobileHeader } from "@/components/layout/MobileHeader";

import { Sidebar } from "@/components/Sidebar";
import { useMobile } from "@/hooks/useMobile";
import styles from "./MainLayout.module.css";

export interface MainLayoutProps {
  currentView: string;
  onChangeView: (view: string) => void;
  title?: string;
  children: React.ReactNode;
}

export const MainLayout = ({
  currentView,
  onChangeView,
  title,
  children,
}: MainLayoutProps) => {
  const isMobile = useMobile();

  return (
    <div className={`${styles.container} ${isMobile ? styles.mobile : ""}`}>
      {/* Mobile-Native Header (Injected from Pro if exists) */}
      {isMobile && (
        <MobileHeader
          title={title}
          currentView={currentView}
          onChangeView={onChangeView}
        />
      )}

      {!isMobile && (
        <Sidebar currentView={currentView} onChangeView={onChangeView} />
      )}

      <main
        className={`${styles.main} ${isMobile ? "pt-[calc(64px+env(safe-area-inset-top))]" : ""}`}
      >
        {!isMobile && title && (
          <header className={`${styles.header} px-8`}>{title}</header>
        )}

        <div
          className={`${styles.content} ${isMobile ? "pb-safe p-4" : "p-8"}`}
        >
          {children}
        </div>
      </main>
    </div>
  );
};
