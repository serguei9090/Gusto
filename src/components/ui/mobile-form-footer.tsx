import type { HTMLAttributes } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MobileFormFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * A standardized footer for forms and modals that handles safe areas and sticky positioning on mobile.
 *
 * Behavior:
 * - Mobile: Sticky at bottom, full width (-mx-4), padding for safe area (pb-safe), top border.
 * - Desktop (sm): Static, normal width, no top border, right-aligned.
 */
export function MobileFormFooter({
  children,
  className,
  ...props
}: MobileFormFooterProps) {
  return (
    <DialogFooter
      className={cn(
        // Refined Styles (Tested in Dev)
        "sticky px-2 pb-1 pt-2 border-t bg-background",
        "sm:static sm:mx-0 sm:px-2 sm:pb-2 sm:pt-2",
        "flex flex-row sm:justify-end gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </DialogFooter>
  );
}
