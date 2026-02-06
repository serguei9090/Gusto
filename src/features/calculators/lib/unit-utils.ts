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
    tsp: 4.92892,
    tbsp: 14.7868,
    cup: 236.588,
    pt: 473.176,
    qt: 946.353,
    gal: 3785.41,
    floz: 29.5735,
};

export const UNIT_TYPES: Record<string, string[]> = {
    Mass: ["g", "kg", "oz", "lb"],
    Volume: ["ml", "l", "tsp", "tbsp", "cup", "floz", "gal"],
    Each: ["unit", "piece", "ct"],
};

export const convert = (value: number, from: string, to: string): number => {
    if (from === to) return value;

    const fromRate = CONVERSION_RATES[from];
    const toRate = CONVERSION_RATES[to];

    if (!fromRate || !toRate) return value; // Fallback for incompatible or unknown units

    const baseValue = value * fromRate;
    return baseValue / toRate;
};

export const getUnitType = (unit: string): string | null => {
    for (const [type, units] of Object.entries(UNIT_TYPES)) {
        if (units.includes(unit)) return type;
    }
    return null;
};
