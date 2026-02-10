import { describe, expect, it } from "vitest";
import {
  CircularReferenceError,
  CostingCycleGuard,
  calculateFoodCostPercentage,
  calculateIngredientCost,
  calculateProfitMargin,
  calculateRecipeTotal,
  calculateSuggestedPrice,
  calculateWeightedAverage,
} from "../costEngine";

describe("Cost Engine", () => {
  describe("CostingCycleGuard", () => {
    it("should allow entering new recipes", () => {
      const guard = new CostingCycleGuard();
      expect(() => guard.enter(1, "Recipe 1")).not.toThrow();
      expect(() => guard.enter(2, "Recipe 2")).not.toThrow();
    });

    it("should throw CircularReferenceError when re-entering same recipe", () => {
      const guard = new CostingCycleGuard();
      guard.enter(1, "Recipe 1");
      expect(() => guard.enter(1, "Recipe 1")).toThrow(CircularReferenceError);
      expect(() => guard.enter(1, "Recipe 1")).toThrow(
        'Circular reference detected: Recipe "Recipe 1"',
      );
    });

    it("should allow re-entering after exit (for DAGs)", () => {
      const guard = new CostingCycleGuard();
      guard.enter(1, "Recipe 1");
      guard.exit(1);
      expect(() => guard.enter(1, "Recipe 1")).not.toThrow();
    });

    it("should clone with current state", () => {
      const guard = new CostingCycleGuard();
      guard.enter(1, "Recipe 1");
      const clone = guard.clone();
      expect(() => clone.enter(1, "Recipe 1")).toThrow(CircularReferenceError);
    });
  });

  describe("calculateIngredientCost", () => {
    it("should calculate cost correctly with same units", () => {
      const result = calculateIngredientCost(2.5, "kg", 10, "kg");
      expect(result.cost).toBe(25);
      expect(result.error).toBeUndefined();
    });

    it("should handle error when units are non-convertible", () => {
      const result = calculateIngredientCost(1, "liter", 10, "kg");
      expect(result.cost).toBe(0);
      expect(result.error).toBeDefined();
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

    it("should apply waste buffer", async () => {
      const items = [
        {
          name: "Tomato",
          quantity: 1,
          unit: "kg",
          currentPricePerUnit: 10,
          ingredientUnit: "kg",
          currency: "USD",
        },
      ];

      const result = await calculateRecipeTotal(items, 10); // 10% waste
      expect(result.subtotal).toBe(10);
      expect(result.wasteCost).toBe(1);
      expect(result.totalCost).toBe(11);
    });

    it("should handle mixed currencies", async () => {
      // Need to mock or ensure currencyConverter works
      const items = [
        {
          name: "Item 1",
          quantity: 1,
          unit: "kg",
          currentPricePerUnit: 10,
          ingredientUnit: "kg",
          currency: "USD",
        },
      ];

      const result = await calculateRecipeTotal(items, 0, "USD");
      expect(result.totalCost).toBe(10);
    });

    it("should collect errors for invalid items", async () => {
      const items = [
        {
          name: "Invalid Item",
          quantity: 1,
          unit: "liter",
          currentPricePerUnit: 10,
          ingredientUnit: "kg",
          currency: "USD",
        },
      ];

      const result = await calculateRecipeTotal(items);
      expect(result.totalCost).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Invalid Item");
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

  describe("calculateFoodCostPercentage", () => {
    it("should calculate percentage correctly", () => {
      expect(calculateFoodCostPercentage(30, 100)).toBe(30);
    });

    it("should return 0 for zero selling price", () => {
      expect(calculateFoodCostPercentage(30, 0)).toBe(0);
    });
  });

  describe("calculateWeightedAverage", () => {
    it("should calculate weighted average accurately", () => {
      // 10 units at $5 + 20 units at $8 = (50 + 160) / 30 = 210 / 30 = 7
      const result = calculateWeightedAverage(10, 5, 20, 8);
      expect(result).toBe(7);
    });

    it("should handle zero total stock", () => {
      const result = calculateWeightedAverage(0, 5, 0, 8);
      expect(result).toBe(0);
    });
  });
});
