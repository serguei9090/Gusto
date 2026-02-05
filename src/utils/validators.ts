import { z } from "zod";

// Ingredient Category Enum
export const ingredientCategorySchema = z.enum([
  "protein",
  "vegetable",
  "dairy",
  "spice",
  "grain",
  "fruit",
  "condiment",
  "other",
]);

// Unit of Measure Enum
export const unitOfMeasureSchema = z.enum([
  "kg",
  "g",
  "l",
  "ml",
  "piece",
  "cup",
  "tbsp",
  "tsp",
]);

// Create Ingredient Schema
export const createIngredientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  category: ingredientCategorySchema,
  unitOfMeasure: unitOfMeasureSchema,
  currentPrice: z.number().positive("Price must be positive"),
  pricePerUnit: z.number().positive("Price per unit must be positive"),
  currency: z.enum(["USD", "EUR"]).default("USD"),
  supplierId: z.number().int().positive().nullable().optional(),
  minStockLevel: z.number().nonnegative().nullable().optional(),
  currentStock: z.number().nonnegative().default(0),
  notes: z.string().max(500).nullable().optional(),
});

// Update Ingredient Schema (all fields optional)
export const updateIngredientSchema = createIngredientSchema.partial();

// Recipe Category Enum
export const recipeCategorySchema = z.enum([
  "appetizer",
  "main",
  "dessert",
  "beverage",
  "side",
  "other",
]);

// Transaction Type Enum
export const transactionTypeSchema = z.enum([
  "purchase",
  "usage",
  "adjustment",
  "waste",
]);

// Create Supplier Schema
export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  contactPerson: z.string().max(100).nullable().optional(),
  email: z.union([z.string().email({ message: "Invalid email" }), z.literal("")]).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  paymentTerms: z.string().max(200).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

// Create Recipe Schema
export const createRecipeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).nullable().optional(),
  category: recipeCategorySchema.nullable().optional(),
  servings: z.number().int().positive("Servings must be positive"),
  prepTimeMinutes: z.number().int().nonnegative().nullable().optional(),
  cookingInstructions: z.string().nullable().optional(),
  sellingPrice: z.number().positive().nullable().optional(),
  currency: z.enum(["USD", "EUR"]).default("USD"),
  targetCostPercentage: z.number().min(0).max(100).nullable().optional(),
});

export const recipeIngredientFormSchema = z.object({
  ingredientId: z.number().int().positive("Ingredient required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit required"),
  // UI Helpers
  name: z.string().optional(),
  price: z.number().optional(),
  ingredientUnit: z.string().optional(),
});

export const recipeFormSchema = createRecipeSchema.extend({
  ingredients: z.array(recipeIngredientFormSchema).default([]),
});

// Create Inventory Transaction Schema
export const createTransactionSchema = z.object({
  ingredientId: z.number().int().positive(),
  transactionType: transactionTypeSchema,
  quantity: z.number(),
  costPerUnit: z.number().positive().nullable().optional(),
  totalCost: z.number().nullable().optional(),
  reference: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});
