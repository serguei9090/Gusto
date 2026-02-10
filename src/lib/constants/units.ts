/**
 * Reference catalog of standard measurement units.
 *
 * This file is NOT the runtime source of truth for available units.
 * The user's active units are stored dynamically in the `configuration_items`
 * database table and accessed via `useConfigStore().getUnits()`.
 *
 * This catalog is used exclusively for:
 * - `UnitConfigModal`: presenting all toggleable units to the user.
 * - `configRepository.restoreDefaults()`: re-seeding the DB with standard units.
 * - `UnitSelect`: display ordering and category labels for the dropdown.
 */
export const STANDARD_UNITS = {
  Mass: [
    // Metric
    "kg",
    "g",
    "mg",
    // Imperial
    "lb",
    "oz",
  ],
  Volume: [
    // Metric
    "l",
    "ml",
    "cl",
    "dl",
    // Imperial / US Customary
    "gal",
    "qt",
    "pt",
    "cup",
    "fl oz",
    "tbsp",
    "tsp",
    // Kitchen specific
    "dash",
    "pinch",
    "drop",
  ],
  Misc: [
    "pack",
    "bunch",
    "box",
    "case",
    "can",
    "bottle",
    "jar",
    "bag",
    "bundle",
    "roll",
  ],
  Length: ["m", "cm", "mm", "in", "ft", "yd"],
  Other: ["each", "piece"],
} as const;

// Display ordering for common units
export const UNIT_DISPLAY_ORDER: Record<string, string[]> = {
  mass: ["mg", "g", "oz", "lb", "kg"],
  volume: ["ml", "tsp", "tbsp", "cup", "pt", "qt", "l", "gal"],
  other: ["piece", "each"],
};

export const UNIT_CATEGORY_LABELS: Record<string, string> = {
  mass: "Mass / Weight",
  volume: "Volume",
  other: "Other",
  length: "Length",
  misc: "Misc",
};
