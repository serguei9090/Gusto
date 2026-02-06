import { describe, expect, it } from "vitest";
import {
  convertUnit,
  getUnitType,
  MASS_UNITS,
  VOLUME_UNITS,
} from "../conversions";

describe("Unit Conversions", () => {
  describe("getUnitType", () => {
    it("should identify mass units", () => {
      expect(getUnitType("kg")).toBe("mass");
      expect(getUnitType("g")).toBe("mass");
      expect(getUnitType("mg")).toBe("mass");
      expect(getUnitType("oz")).toBe("mass");
      expect(getUnitType("lb")).toBe("mass");
    });

    it("should identify volume units", () => {
      expect(getUnitType("l")).toBe("volume");
      expect(getUnitType("ml")).toBe("volume");
      expect(getUnitType("cup")).toBe("volume");
      expect(getUnitType("tbsp")).toBe("volume");
      expect(getUnitType("tsp")).toBe("volume");
      expect(getUnitType("gallon")).toBe("volume");
    });

    it("should identify piece units", () => {
      expect(getUnitType("piece")).toBe("piece");
    });

    it("should return unknown for unrecognized units", () => {
      expect(getUnitType("invalid")).toBe("unknown");
      expect(getUnitType("banana")).toBe("unknown");
      expect(getUnitType("")).toBe("unknown");
    });
  });

  describe("convertUnit - Same Unit", () => {
    it("should return same value for identical units", () => {
      expect(convertUnit(10, "kg", "kg")).toBe(10);
      expect(convertUnit(5.5, "ml", "ml")).toBe(5.5);
      expect(convertUnit(100, "piece", "piece")).toBe(100);
    });
  });

  describe("convertUnit - Mass Conversions", () => {
    it("should convert kg to g", () => {
      expect(convertUnit(1, "kg", "g")).toBe(1000);
      expect(convertUnit(2.5, "kg", "g")).toBe(2500);
      expect(convertUnit(0.5, "kg", "g")).toBe(500);
    });

    it("should convert g to kg", () => {
      expect(convertUnit(1000, "g", "kg")).toBe(1);
      expect(convertUnit(500, "g", "kg")).toBe(0.5);
      expect(convertUnit(2500, "g", "kg")).toBe(2.5);
    });

    it("should convert g to mg", () => {
      expect(convertUnit(1, "g", "mg")).toBe(1000);
      expect(convertUnit(0.5, "g", "mg")).toBe(500);
    });

    it("should convert mg to g", () => {
      expect(convertUnit(1000, "mg", "g")).toBe(1);
      expect(convertUnit(500, "mg", "g")).toBe(0.5);
    });

    it("should convert kg to mg", () => {
      expect(convertUnit(1, "kg", "mg")).toBe(1000000);
      expect(convertUnit(0.001, "kg", "mg")).toBe(1000);
    });

    it("should convert oz to g", () => {
      const result = convertUnit(1, "oz", "g");
      expect(result).toBeCloseTo(28.3495, 2);
    });

    it("should convert lb to kg", () => {
      const result = convertUnit(1, "lb", "kg");
      expect(result).toBeCloseTo(0.453592, 3);
    });

    it("should convert lb to oz", () => {
      const result = convertUnit(1, "lb", "oz");
      expect(result).toBeCloseTo(16, 1);
    });
  });

  describe("convertUnit - Volume Conversions", () => {
    it("should convert L to mL", () => {
      expect(convertUnit(1, "l", "ml")).toBe(1000);
      expect(convertUnit(2.5, "l", "ml")).toBe(2500);
      expect(convertUnit(0.5, "l", "ml")).toBe(500);
    });

    it("should convert mL to L", () => {
      expect(convertUnit(1000, "ml", "l")).toBe(1);
      expect(convertUnit(500, "ml", "l")).toBe(0.5);
      expect(convertUnit(2500, "ml", "l")).toBe(2.5);
    });

    it("should convert cup to mL", () => {
      const result = convertUnit(1, "cup", "ml");
      expect(result).toBeCloseTo(236.588, 2);
    });

    it("should convert tbsp to mL", () => {
      expect(convertUnit(1, "tbsp", "ml")).toBe(15);
      expect(convertUnit(2, "tbsp", "ml")).toBe(30);
    });

    it("should convert tsp to mL", () => {
      expect(convertUnit(1, "tsp", "ml")).toBe(5);
      expect(convertUnit(3, "tsp", "ml")).toBe(15);
    });

    it("should convert tbsp to tsp", () => {
      const result = convertUnit(1, "tbsp", "tsp");
      expect(result).toBeCloseTo(3, 1);
    });

    it("should convert gallon to L", () => {
      const result = convertUnit(1, "gallon", "l");
      expect(result).toBeCloseTo(3.78541, 2);
    });

    it("should convert cup to L", () => {
      const result = convertUnit(4, "cup", "l");
      expect(result).toBeCloseTo(0.946352, 3);
    });
  });

  describe("convertUnit - Error Handling", () => {
    it("should throw error for mass to volume conversion", () => {
      expect(() => convertUnit(10, "kg", "ml")).toThrow();
      expect(() => convertUnit(10, "kg", "ml")).toThrow(
        /Cannot convert incompatibility unit types/,
      );
    });

    it("should throw error for volume to mass conversion", () => {
      expect(() => convertUnit(10, "l", "g")).toThrow();
      expect(() => convertUnit(10, "ml", "kg")).toThrow(
        /Cannot convert incompatibility unit types/,
      );
    });

    it("should throw error for piece to mass conversion", () => {
      expect(() => convertUnit(10, "piece", "kg")).toThrow();
    });

    it("should throw error for piece to volume conversion", () => {
      expect(() => convertUnit(10, "piece", "ml")).toThrow();
    });

    it("should throw error for unknown units", () => {
      expect(() => convertUnit(10, "invalid", "kg")).toThrow();
      expect(() => convertUnit(10, "kg", "invalid")).toThrow();
    });
  });

  describe("convertUnit - Edge Cases", () => {
    it("should handle zero values", () => {
      expect(convertUnit(0, "kg", "g")).toBe(0);
      expect(convertUnit(0, "l", "ml")).toBe(0);
    });

    it("should handle very small decimal conversions", () => {
      expect(convertUnit(0.001, "kg", "g")).toBe(1);
      expect(convertUnit(0.001, "l", "ml")).toBe(1);
    });

    it("should handle large number conversions", () => {
      expect(convertUnit(1000, "kg", "g")).toBe(1000000);
      expect(convertUnit(1000, "l", "ml")).toBe(1000000);
    });

    it("should handle fractional conversions accurately", () => {
      const result = convertUnit(0.333, "kg", "g");
      expect(result).toBeCloseTo(333, 2);
    });
  });

  describe("Real-World Recipe Scenarios", () => {
    it("should convert recipe ingredient from kg to g", () => {
      // Recipe calls for 0.25kg of flour
      const result = convertUnit(0.25, "kg", "g");
      expect(result).toBe(250);
    });

    it("should convert recipe ingredient from cups to mL", () => {
      // Recipe calls for 2 cups of milk
      const result = convertUnit(2, "cup", "ml");
      expect(result).toBeCloseTo(473.176, 2);
    });

    it("should convert inventory purchase from lb to kg", () => {
      // Purchased 50 lb of meat, need to store in kg
      const result = convertUnit(50, "lb", "kg");
      expect(result).toBeCloseTo(22.6796, 2);
    });

    it("should convert small spice measurements", () => {
      // Convert 2 tsp to mL for standardization
      const result = convertUnit(2, "tsp", "ml");
      expect(result).toBe(10);
    });

    it("should handle ingredient cost calculation conversion", () => {
      // Ingredient priced at $10/kg, recipe uses 500g
      const quantityInKg = convertUnit(500, "g", "kg");
      const cost = quantityInKg * 10;
      expect(quantityInKg).toBe(0.5);
      expect(cost).toBe(5);
    });
  });

  describe("Unit Constants", () => {
    it("should export mass units array", () => {
      expect(MASS_UNITS).toContain("kg");
      expect(MASS_UNITS).toContain("g");
      expect(MASS_UNITS).toContain("mg");
      expect(MASS_UNITS).toContain("oz");
      expect(MASS_UNITS).toContain("lb");
    });

    it("should export volume units array", () => {
      expect(VOLUME_UNITS).toContain("l");
      expect(VOLUME_UNITS).toContain("ml");
      expect(VOLUME_UNITS).toContain("cup");
      expect(VOLUME_UNITS).toContain("tbsp");
      expect(VOLUME_UNITS).toContain("tsp");
      expect(VOLUME_UNITS).toContain("gallon");
    });
  });
});
