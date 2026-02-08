import { describe, expect, it } from "vitest";
import {
  calculateIngredientCost,
  calculateProfitMargin,
  calculateRecipeTotal,
  calculateSuggestedPrice,
} from "../costEngine";

describe("Cost Engine", () => {
  describe("calculateIngredientCost", () => {
    it("should calculate cost correctly with same units", () => {
      const result = calculateIngredientCost(2.5, "kg", 10, "kg");
      expect(result.cost).toBe(25);
      expect(result.error).toBeUndefined();
    });

    it("should handle zero quantity", () => {
      const result = calculateIngredientCost(0, "kg", 10, "kg");
      expect(result.cost).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it("should convert units (kg to g)", () => {
      // 2kg at $10/kg = $20
      const result = calculateIngredientCost(2000, "g", 10, "kg");
      expect(result.cost).toBe(20);
    });

    it("should convert units (g to kg)", () => {
      // 500g = 0.5kg at $10/kg = $5
      const result = calculateIngredientCost(500, "g", 10, "kg");
      expect(result.cost).toBe(5);
    });
  });

  describe("calculateRecipeTotal", () => {
    it("should sum ingredient costs", async () => {
      const items = [
        {
          name: "Tomatoes",
          quantity: 2,
          unit: "kg",
          currentPricePerUnit: 5,
          ingredientUnit: "kg",
          currency: "USD",
        },
        {
          name: "Cheese",
          quantity: 1,
          unit: "kg",
          currentPricePerUnit: 10,
          ingredientUnit: "kg",
          currency: "USD",
        },
      ];

      const result = await calculateRecipeTotal(items);
      expect(result.totalCost).toBe(20);
      expect(result.errors).toEqual([]);
    });

    it("should handle unit conversions", async () => {
      const items = [
        {
          name: "Flour",
          quantity: 500,
          unit: "g",
          currentPricePerUnit: 2,
          ingredientUnit: "kg",
          currency: "USD",
        },
      ];

      const result = await calculateRecipeTotal(items);
      // 500g = 0.5kg at $2/kg = $1
      expect(result.totalCost).toBe(1);
    });
  });

  describe("calculateProfitMargin", () => {
    it("should calculate margin correctly", () => {
      const margin = calculateProfitMargin(70, 100);
      expect(margin).toBe(30);
    });

    it("should return 0 for zero selling price", () => {
      const margin = calculateProfitMargin(50, 0);
      expect(margin).toBe(0);
    });

    it("should handle negative margin (loss)", () => {
      const margin = calculateProfitMargin(70, 50);
      expect(margin).toBe(-40);
    });

    it("should handle equal cost and price (no profit)", () => {
      const margin = calculateProfitMargin(100, 100);
      expect(margin).toBe(0);
    });
  });

  describe("calculateSuggestedPrice", () => {
    it("should suggest price based on target food cost percentage", () => {
      // If cost is $30 and target cost is 30%, suggested price is $100
      const suggestedPrice = calculateSuggestedPrice(30, 30);
      expect(suggestedPrice).toBeCloseTo(100, 2);
    });

    it("should return break-even price for 100% food cost target", () => {
      // If cost is $30 and target cost is 100%, price is $30 (no profit)
      const suggestedPrice = calculateSuggestedPrice(30, 100);
      expect(suggestedPrice).toBe(30);
    });

    it("should return 0 for non-positive target percentage", () => {
      expect(calculateSuggestedPrice(30, 0)).toBe(0);
      expect(calculateSuggestedPrice(30, -10)).toBe(0);
    });

    it("should calculate suggested price for 25% food cost target", () => {
      // If cost is $30 and target cost is 25%, suggested price is $120
      const suggestedPrice = calculateSuggestedPrice(30, 25);
      expect(suggestedPrice).toBeCloseTo(120, 2);
    });
  });
});
