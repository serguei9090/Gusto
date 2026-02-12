import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMobileComponent } from "@/lib/mobile-registry";

// biome-ignore lint/suspicious/noExplicitAny: proxy component
export const MobileHeader = (props: any) => {
  const Component = useMobileComponent("MobileHeader");

  if (Component) {
    return <Component {...props} />;
  }

  // Fallback for Core Mode: Simple header with Sidebar drawer
  return (
    <header className="fixed top-0 left-0 right-0 h-[calc(64px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-card border-b flex items-center px-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="p-2 -ml-2 hover:bg-muted rounded-md transition-colors"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[256px] pt-safe" hideClose>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Access application modules</SheetDescription>
          </SheetHeader>
          <Sidebar
            currentView={props.currentView}
            onChangeView={props.onChangeView}
          />
        </SheetContent>
      </Sheet>
      {props.title && (
        <h1 className="ml-4 text-lg font-bold truncate">{props.title}</h1>
      )}
    </header>
  );
};
