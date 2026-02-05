// @ts-nocheck
import { describe, expect, it } from "bun:test";
import { calculateIngredientCost, calculateProfitMargin } from "./costEngine";

describe("Cost Engine", () => {
  it("calculates ingredient cost (same unit)", () => {
    // 100g of something at $0.05 per g
    const res = calculateIngredientCost(100, "g", 0.05, "g");
    expect(res.cost).toBe(5);
    expect(res.error).toBeUndefined();
  });

  test("calculates ingredient cost (conversion kg -> g)", () => {
    // 1 kg used, price is $0.02 per g.
    // 1kg = 1000g. 1000 * 0.02 = 20.
    const res = calculateIngredientCost(1, "kg", 0.02, "g");
    expect(res.cost).toBe(20);
  });

  test("calculates ingredient cost (conversion Cup -> ML)", () => {
    // 0.5 Cup used. Price is $0.10 per ML.
    // 1 Cup = 236.588 ml. 0.5 Cup = 118.294.
    // 118.294 * 0.10 = 11.8294
    const res = calculateIngredientCost(0.5, "cup", 0.1, "ml");
    expect(res.cost).toBeCloseTo(11.829, 3);
  });

  test("returns error for incompatible units", () => {
    const res = calculateIngredientCost(1, "kg", 10, "ml");
    expect(res.cost).toBe(0);
    expect(res.error).toBeDefined();
  });
});

describe("Profit Margin", () => {
  test("calculates margin correctly", () => {
    // Cost 30, Sell 100. (70/100) = 70%.
    expect(calculateProfitMargin(30, 100)).toBe(70);
  });

  test("handles zero selling price", () => {
    expect(calculateProfitMargin(10, 0)).toBe(0);
  });
});
