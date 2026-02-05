
export const MASS_UNITS = ["kg", "g", "mg", "oz", "lb"];
export const VOLUME_UNITS = ["l", "ml", "cup", "tbsp", "tsp", "gallon"];

const MASS_TO_GRAMS: Record<string, number> = {
    "kg": 1000,
    "g": 1,
    "mg": 0.001,
    "oz": 28.3495,
    "lb": 453.592
};

const VOLUME_TO_ML: Record<string, number> = {
    "l": 1000,
    "ml": 1,
    "cup": 236.588,
    "tbsp": 15,
    "tsp": 5,
    "gallon": 3785.41
};

export function getUnitType(unit: string): "mass" | "volume" | "piece" | "unknown" {
    if (MASS_TO_GRAMS[unit]) return "mass";
    if (VOLUME_TO_ML[unit]) return "volume";
    if (unit === "piece") return "piece";
    return "unknown";
}

/**
 * Converts a value from one unit to another.
 * Throws error if conversion is impossible (e.g. Mass -> Volume).
 */
export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return value;

    const fromType = getUnitType(fromUnit);
    const toType = getUnitType(toUnit);

    if (fromType !== toType) {
        throw new Error(`Cannot convert incompatibility unit types: ${fromUnit} (${fromType}) to ${toUnit} (${toType})`);
    }

    if (fromType === "mass") {
        const grams = value * MASS_TO_GRAMS[fromUnit];
        return grams / MASS_TO_GRAMS[toUnit];
    }

    if (fromType === "volume") {
        const ml = value * VOLUME_TO_ML[fromUnit];
        return ml / VOLUME_TO_ML[toUnit];
    }

    // Pieces map 1:1 if we are here (implied)
    return value;
}
