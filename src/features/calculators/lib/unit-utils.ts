export const CONVERSION_RATES: Record<string, number> = {
  // Mass (base is grams)
  g: 1,
  kg: 1000,
  mg: 0.001,
  oz: 28.3495,
  lb: 453.592,

  // Volume (base is ml)
  ml: 1,
  l: 1000,
  cl: 10,
  dl: 100,
  tsp: 4.92892,
  tbsp: 14.7868,
  "fl oz": 29.5735,
  cup: 236.588,
  pt: 473.176,
  qt: 946.353,
  gal: 3785.41,

  // Kitchen Specific Volume
  dash: 0.616115,
  pinch: 0.308058,
  drop: 0.0513429,

  // Length (base is meter)
  m: 1,
  cm: 0.01,
  mm: 0.001,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
};

// Define valid unit types for checking compatibility
export const UNIT_TYPES: Record<string, string[]> = {
  Mass: ["g", "kg", "mg", "oz", "lb"],
  Volume: [
    "ml",
    "l",
    "cl",
    "dl",
    "tsp",
    "tbsp",
    "fl oz",
    "cup",
    "pt",
    "qt",
    "gal",
    "dash",
    "pinch",
    "drop",
  ],
  Length: ["m", "cm", "mm", "in", "ft", "yd"],
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
  Other: ["each", "piece"],
};

export const convert = (value: number, from: string, to: string): number => {
  if (from === to) return value;

  const fromRate = CONVERSION_RATES[from];
  const toRate = CONVERSION_RATES[to];

  // If conversion rates exist, use them (Mass, Volume, Length)
  if (fromRate && toRate) {
    // Check basic compatibility implicitly by existence in rate map.
    // However, crossing Mass <-> Volume requires density (assumed 1g = 1ml for water/generic),
    // but mixing Length <-> Mass is invalid.
    // For this simple util, we might want to check types.
    const fromType = getUnitType(from);
    const toType = getUnitType(to);

    if (fromType !== toType && fromType !== null && toType !== null) {
      // Allow Mass <-> Volume as a "kitchen hack" (1g ~= 1ml)?
      // Or strictly forbid?
      // User asked for "proper math", so let's check types.
      // BUT users often want to convert kg to liters for water-based stuff.
      // For now, let's STRICTLY enforce type equality to avoid logic errors,
      // unless specific density is provided (which this simple fn doesn't have).
      return 0;
    }

    const baseValue = value * fromRate;
    return baseValue / toRate;
  }

  // Count units are not convertible without item specific info
  return 0;
};

export const getUnitType = (unit: string): string | null => {
  for (const [type, units] of Object.entries(UNIT_TYPES)) {
    if (units.includes(unit)) return type;
  }
  return null;
};
