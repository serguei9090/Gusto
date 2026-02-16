import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SortableWidgetWrapperProps {
  id: string;
  children: ReactNode;
  isRearranging: boolean;
  className?: string;
}

export const SortableWidgetWrapper = ({
  id,
  children,
  isRearranging,
  className,
}: SortableWidgetWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto", // Ensure dragged item is on top
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isRearranging ? { ...attributes, ...listeners } : {})}
      className={cn(
        className,
        // Visual cues for rearranging mode
        isRearranging &&
          "cursor-move border border-dashed border-primary/50 bg-accent/5 rounded-lg relative hover:bg-accent/10 transition-colors",
        isRearranging && "before:absolute before:inset-0 before:z-50", // Overlay to prevent interaction with widget content while dragging
        // Dragging state
        isDragging &&
          "opacity-80 scale-105 shadow-xl border-primary z-50 bg-background",
      )}
    >
      {/* Optional: Add a visible grip handle icon in the corner if preferred, 
          but making the whole card draggable is often better for grids */}
      {children}
    </div>
  );
};
