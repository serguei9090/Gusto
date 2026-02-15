import { MobileHeader } from "@/components/layout/MobileHeader";
import { Sidebar } from "@/components/Sidebar";

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
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-background">
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
          <header className="hidden md:flex items-center h-16 bg-card border-b px-8 font-semibold text-lg text-foreground shrink-0">
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
