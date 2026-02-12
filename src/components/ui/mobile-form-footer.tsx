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
        // Mobile styles
        "sticky -bottom-4 -mx-4 px-4 pb-safe pt-4 border-t bg-background",
        // Desktop styles (resetting mobile)
        "sm:static sm:mx-0 sm:px-0 sm:pb-0 sm:pt-0 sm:border-t-0",
        // Flex layout
        "flex flex-row sm:justify-end gap-2",
        className,
      )}
      {...props}
    >
      {children}
    </DialogFooter>
  );
}
