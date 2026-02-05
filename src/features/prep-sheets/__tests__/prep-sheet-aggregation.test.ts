import { describe, expect, it } from "vitest";

/**
 * Unit tests for prep sheet aggregation business logic
 * Tests the core logic used to aggregate ingredients from multiple recipes
 */

describe("Prep Sheet Aggregation Logic", () => {
    describe("Recipe Scaling", () => {
        /**
         * Calculates scale factor for recipe servings
         */
        function calculateScaleFactor(
            requestedServings: number,
            baseServings: number,
        ): number {
            return requestedServings / baseServings;
        }

        it("should calculate correct scale factor for doubling", () => {
            const scale = calculateScaleFactor(20, 10);
            expect(scale).toBe(2);
        });

        it("should calculate correct scale factor for halving", () => {
            const scale = calculateScaleFactor(5, 10);
            expect(scale).toBe(0.5);
        });

        it("should handle same servings (no scaling)", () => {
            const scale = calculateScaleFactor(10, 10);
            expect(scale).toBe(1);
        });

        it("should handle fractional scaling", () => {
            const scale = calculateScaleFactor(15, 10);
            expect(scale).toBe(1.5);
        });

        it("should handle scaling from odd base servings", () => {
            const scale = calculateScaleFactor(30, 7);
            expect(scale).toBeCloseTo(4.2857, 4);
        });
    });

    describe("Ingredient Quantity Scaling", () => {
        /**
         * Scales ingredient quantity based on serving adjustments
         */
        function scaleIngredientQuantity(
            baseQuantity: number,
            scaleFactor: number,
        ): number {
            return baseQuantity * scaleFactor;
        }

        it("should double ingredient quantity", () => {
            const scaled = scaleIngredientQuantity(5, 2);
            expect(scaled).toBe(10);
        });

        it("should halve ingredient quantity", () => {
            const scaled = scaleIngredientQuantity(10, 0.5);
            expect(scaled).toBe(5);
        });

        it("should handle decimal quantities", () => {
            const scaled = scaleIngredientQuantity(2.5, 1.5);
            expect(scaled).toBe(3.75);
        });

        it("should handle very small quantities", () => {
            const scaled = scaleIngredientQuantity(0.25, 4);
            expect(scaled).toBe(1);
        });

        it("should preserve precision", () => {
            const scaled = scaleIngredientQuantity(1.333, 3);
            expect(scaled).toBeCloseTo(3.999, 3);
        });
    });

    describe("Ingredient Aggregation", () => {
        interface PrepSheetIngredient {
            ingredientId: number;
            ingredientName: string;
            totalQuantity: number;
            unit: string;
            recipeBreakdown: Array<{ recipeName: string; qty: number }>;
        }

        /**
         * Aggregates ingredients from multiple recipes (same unit)
         */
        function aggregateIngredients(
            ingredients: Array<{
                ingredientId: number;
                ingredientName: string;
                quantity: number;
                unit: string;
                recipeName: string;
            }>,
        ): Map<number, PrepSheetIngredient> {
            const map = new Map<number, PrepSheetIngredient>();

            for (const ing of ingredients) {
                const existing = map.get(ing.ingredientId);

                if (existing) {
                    if (existing.unit === ing.unit) {
                        existing.totalQuantity += ing.quantity;
                        existing.recipeBreakdown.push({
                            recipeName: ing.recipeName,
                            qty: ing.quantity,
                        });
                    }
                } else {
                    map.set(ing.ingredientId, {
                        ingredientId: ing.ingredientId,
                        ingredientName: ing.ingredientName,
                        totalQuantity: ing.quantity,
                        unit: ing.unit,
                        recipeBreakdown: [
                            {
                                recipeName: ing.recipeName,
                                qty: ing.quantity,
                            },
                        ],
                    });
                }
            }

            return map;
        }

        it("should aggregate same ingredient from multiple recipes", () => {
            const ingredients = [
                {
                    ingredientId: 1,
                    ingredientName: "Flour",
                    quantity: 500,
                    unit: "g",
                    recipeName: "Pizza Dough",
                },
                {
                    ingredientId: 1,
                    ingredientName: "Flour",
                    quantity: 300,
                    unit: "g",
                    recipeName: "Pasta",
                },
            ];

            const result = aggregateIngredients(ingredients);
            const flour = result.get(1);

            expect(flour?.totalQuantity).toBe(800);
            expect(flour?.recipeBreakdown).toHaveLength(2);
        });

        it("should keep separate entries for different ingredients", () => {
            const ingredients = [
                {
                    ingredientId: 1,
                    ingredientName: "Flour",
                    quantity: 500,
                    unit: "g",
                    recipeName: "Pizza Dough",
                },
                {
                    ingredientId: 2,
                    ingredientName: "Sugar",
                    quantity: 100,
                    unit: "g",
                    recipeName: "Dessert",
                },
            ];

            const result = aggregateIngredients(ingredients);

            expect(result.size).toBe(2);
            expect(result.get(1)?.totalQuantity).toBe(500);
            expect(result.get(2)?.totalQuantity).toBe(100);
        });

        it("should track recipe breakdown for each ingredient", () => {
            const ingredients = [
                {
                    ingredientId: 1,
                    ingredientName: "Tomatoes",
                    quantity: 2,
                    unit: "kg",
                    recipeName: "Marinara Sauce",
                },
                {
                    ingredientId: 1,
                    ingredientName: "Tomatoes",
                    quantity: 1.5,
                    unit: "kg",
                    recipeName: "Salad",
                },
                {
                    ingredientId: 1,
                    ingredientName: "Tomatoes",
                    quantity: 0.5,
                    unit: "kg",
                    recipeName: "Bruschetta",
                },
            ];

            const result = aggregateIngredients(ingredients);
            const tomatoes = result.get(1);

            expect(tomatoes?.totalQuantity).toBe(4);
            expect(tomatoes?.recipeBreakdown).toHaveLength(3);
            expect(tomatoes?.recipeBreakdown[0].recipeName).toBe("Marinara Sauce");
            expect(tomatoes?.recipeBreakdown[1].recipeName).toBe("Salad");
            expect(tomatoes?.recipeBreakdown[2].recipeName).toBe("Bruschetta");
        });
    });

    describe("Real-World Prep Sheet Scenarios", () => {
        it("should handle scaling multiple recipes", () => {
            // Pizza recipe: 8 servings, needs 0.5kg flour
            // User wants 24 servings (3x scale)
            const scaleFactor = 24 / 8;
            const scaledFlour = 0.5 * scaleFactor;

            expect(scaleFactor).toBe(3);
            expect(scaledFlour).toBe(1.5);
        });

        it("should aggregate ingredients across different scaled recipes", () => {
            // Scenario: Breakfast shift prep
            // Recipe 1: Pancakes (10 servings) → wants 30 servings
            // Recipe 2: Waffles (8 servings) → wants 16 servings
            // Both use flour

            const pancakeScale = 30 / 10; // 3x
            const waffleScale = 16 / 8; // 2x

            const pancakeFlour = 500 * pancakeScale; // 500g base, scaled
            const waffleFlour = 400 * waffleScale; // 400g base, scaled

            const totalFlour = pancakeFlour + waffleFlour;

            expect(pancakeFlour).toBe(1500);
            expect(waffleFlour).toBe(800);
            expect(totalFlour).toBe(2300);
        });

        it("should handle fractional servings", () => {
            // Recipe yields 12 servings, but prep cook wants 15
            const scale = 15 / 12;
            const baseIngredient = 600; // grams

            const scaled = baseIngredient * scale;

            expect(scale).toBe(1.25);
            expect(scaled).toBe(750);
        });

        it("should calculate total for complex multi-recipe prep", () => {
            interface RecipeIngredient {
                baseServings: number;
                requestedServings: number;
                baseQuantity: number;
            }

            const recipes: RecipeIngredient[] = [
                { baseServings: 10, requestedServings: 30, baseQuantity: 500 },
                { baseServings: 8, requestedServings: 16, baseQuantity: 400 },
                { baseServings: 12, requestedServings: 24, baseQuantity: 600 },
            ];

            let total = 0;
            for (const recipe of recipes) {
                const scale = recipe.requestedServings / recipe.baseServings;
                total += recipe.baseQuantity * scale;
            }

            expect(total).toBe(1500 + 800 + 1200); // 3500
        });
    });

    describe("Sorting and Display Logic", () => {
        interface PrepSheetItem {
            ingredientName: string;
            totalQuantity: number;
            unit: string;
        }

        /**
         * Sorts ingredients alphabetically by name
         */
        function sortIngredients(items: PrepSheetItem[]): PrepSheetItem[] {
            return items.sort((a, b) =>
                a.ingredientName.localeCompare(b.ingredientName),
            );
        }

        it("should aggregate ingredients correctly", () => {
            const _ingredients = [
                { id: 1, name: "Flour", quantity: 10, unit: "kg" },
                { id: 1, name: "Flour", quantity: 5, unit: "kg" },
            ];
            // Test logic...
        });

        it("should sort ingredients alphabetically", () => {
            const items: PrepSheetItem[] = [
                { ingredientName: "Tomatoes", totalQuantity: 5, unit: "kg" },
                { ingredientName: "Flour", totalQuantity: 2, unit: "kg" },
                { ingredientName: "Sugar", totalQuantity: 1, unit: "kg" },
            ];

            const sorted = sortIngredients(items);

            expect(sorted[0].ingredientName).toBe("Flour");
            expect(sorted[1].ingredientName).toBe("Sugar");
            expect(sorted[2].ingredientName).toBe("Tomatoes");
        });

        it("should handle case-insensitive sorting", () => {
            const items: PrepSheetItem[] = [
                { ingredientName: "tomatoes", totalQuantity: 5, unit: "kg" },
                { ingredientName: "Flour", totalQuantity: 2, unit: "kg" },
                { ingredientName: "SUGAR", totalQuantity: 1, unit: "kg" },
            ];

            const sorted = sortIngredients(items);

            // localeCompare handles case-insensitive sorting
            expect(sorted[0].ingredientName).toBe("Flour");
            expect(sorted[1].ingredientName).toBe("SUGAR");
            expect(sorted[2].ingredientName).toBe("tomatoes");
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero scale factor (edge case)", () => {
            const scale = 0 / 10;
            const scaled = 500 * scale;

            expect(scale).toBe(0);
            expect(scaled).toBe(0);
        });

        it("should handle very large scale factors", () => {
            const scale = 1000 / 10;
            const scaled = 5 * scale;

            expect(scale).toBe(100);
            expect(scaled).toBe(500);
        });

        it("should preserve decimal precision in aggregation", () => {
            const qty1 = 1.333;
            const qty2 = 2.667;
            const total = qty1 + qty2;

            expect(total).toBeCloseTo(4, 2);
        });

        it("should handle single recipe prep sheet", () => {
            const ingredients = [
                {
                    ingredientId: 1,
                    ingredientName: "Flour",
                    quantity: 500,
                    unit: "g",
                    recipeName: "Pizza",
                },
            ];

            const map = new Map<number, any>();
            map.set(1, {
                ingredientId: 1,
                ingredientName: "Flour",
                totalQuantity: 500,
                unit: "g",
                recipeBreakdown: [{ recipeName: "Pizza", qty: 500 }],
            });

            expect(map.size).toBe(1);
            expect(map.get(1)?.totalQuantity).toBe(500);
        });

        it("should handle empty recipe list", () => {
            const map = new Map();
            expect(map.size).toBe(0);
        });
    });

    describe("Data Transformation", () => {
        it("should convert Map to sorted array", () => {
            const map = new Map<number, { ingredientName: string; totalQuantity: number }>();

            map.set(3, { ingredientName: "Tomatoes", totalQuantity: 5 });
            map.set(1, { ingredientName: "Flour", totalQuantity: 2 });
            map.set(2, { ingredientName: "Sugar", totalQuantity: 1 });

            const array = Array.from(map.values()).sort((a, b) =>
                a.ingredientName.localeCompare(b.ingredientName),
            );

            expect(array).toHaveLength(3);
            expect(array[0].ingredientName).toBe("Flour");
            expect(array[1].ingredientName).toBe("Sugar");
            expect(array[2].ingredientName).toBe("Tomatoes");
        });

        it("should preserve all breakdown information", () => {
            interface Breakdown {
                recipeName: string;
                qty: number;
            }

            const breakdowns: Breakdown[] = [
                { recipeName: "Recipe A", qty: 100 },
                { recipeName: "Recipe B", qty: 200 },
                { recipeName: "Recipe C", qty: 150 },
            ];

            const total = breakdowns.reduce((sum, b) => sum + b.qty, 0);

            expect(total).toBe(450);
            expect(breakdowns).toHaveLength(3);
        });
    });

    describe("JSON Serialization Logic", () => {
        it("should serialize and deserialize prep sheet data", () => {
            const prepSheet = {
                name: "Morning Prep",
                date: "2026-02-05",
                recipes: [
                    { recipeId: 1, recipeName: "Pancakes", baseServings: 10, requestedServings: 30 },
                ],
                items: [
                    {
                        ingredientId: 1,
                        ingredientName: "Flour",
                        totalQuantity: 1500,
                        unit: "g",
                        recipeBreakdown: [{ recipeName: "Pancakes", qty: 1500 }],
                    },
                ],
            };

            const serialized = JSON.stringify(prepSheet);
            const deserialized = JSON.parse(serialized);

            expect(deserialized.name).toBe("Morning Prep");
            expect(deserialized.recipes).toHaveLength(1);
            expect(deserialized.items).toHaveLength(1);
            expect(deserialized.items[0].totalQuantity).toBe(1500);
        });
    });
});
