import type { ComponentType } from "react";
import { useSlot } from "./slot-registry";

interface SlotProps {
  /**
   * The name of the slot to render.
   * Convention: `"page-name:position"`, e.g. `"ingredient-form:after-fields"`.
   */
  readonly name: string;
  /**
   * Optional fallback when no entries are registered.
   * Defaults to rendering nothing.
   */
  readonly fallback?: ComponentType;
  /**
   * Optional extra props forwarded to every slot entry component.
   */
  readonly props?: Record<string, unknown>;
  /**
   * Optional wrapper class for the slot container.
   */
  readonly className?: string;
}

/**
 * Renders all components registered for a named slot.
 *
 * @example
 * // In IngredientForm.tsx (Core):
 * <Slot name="ingredient-form:after-fields" />
 *
 * // The Pro module injects into this slot at init():
 * slotRegistry.register("ingredient-form:after-fields", {
 *   id: "pro-nutrition-panel",
 *   component: NutritionPanel,
 *   order: 10,
 * });
 */
export function Slot({
  name,
  fallback: Fallback,
  props,
  className,
}: SlotProps) {
  const entries = useSlot(name);

  if (entries.length === 0) {
    return Fallback ? <Fallback /> : null;
  }

  return (
    <div className={className} data-slot={name}>
      {entries.map((entry) => {
        const EntryComponent = entry.component;
        return <EntryComponent key={entry.id} {...(props ?? {})} />;
      })}
    </div>
  );
}
