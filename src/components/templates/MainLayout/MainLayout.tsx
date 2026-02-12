import { MobileHeader } from "@/components/layout/MobileHeader";
import { Sidebar } from "@/components/Sidebar";
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
  return (
    <div
      className={`${styles.container} flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-background`}
    >
      {/* Mobile Top Header (with Sidebar Trigger) */}
      <div className="md:hidden">
        <MobileHeader
          title={title}
          currentView={currentView}
          onChangeView={onChangeView}
        />
      </div>

      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex h-full">
        <Sidebar currentView={currentView} onChangeView={onChangeView} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative w-full pt-16 md:pt-0">
        {/* Header - Desktop Only (Title) */}
        {title && (
          <header
            className={`${styles.header} hidden md:flex items-center px-8 text-2xl font-bold`}
          >
            {title}
          </header>
        )}

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-0 md:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
