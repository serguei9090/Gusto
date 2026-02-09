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

export type UnitCategory = keyof typeof STANDARD_UNITS;

export const UNIT_CATEGORIES = Object.keys(STANDARD_UNITS) as UnitCategory[];
