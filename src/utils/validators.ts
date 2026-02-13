import { z } from "zod";

// Ingredient Category
export const ingredientCategorySchema = z.string();

// Unit of Measure
export const unitOfMeasureSchema = z.string().min(1, "Unit is required");

// Create Ingredient Schema
export const createIngredientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  category: ingredientCategorySchema.optional(),
  unitOfMeasure: unitOfMeasureSchema,
  currentPrice: z.number().nonnegative().default(0),
  pricePerUnit: z.number().nonnegative().default(0),
  currency: z.string().length(3).default("USD"),
  supplierId: z.number().int().positive().nullable().optional(),
  minStockLevel: z.number().nonnegative().nullable().optional(),
  currentStock: z.number().nonnegative().default(0),
  notes: z.string().max(500).nullable().optional(),
  purchaseUnit: z.string().max(50).nullable().optional(),
  conversionRatio: z.number().positive().nullable().optional(),
});

// Update Ingredient Schema (all fields optional)
export const updateIngredientSchema = createIngredientSchema.partial();

// Recipe Category
export const recipeCategorySchema = z.string().min(1, "Category is required");

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
  email: z
    .union([z.email({ error: "Invalid email" }), z.literal("")])
    .nullable()
    .optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  paymentTerms: z.string().max(200).nullable().optional(),
  accountNumber: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

// Create Recipe Schema
export const createRecipeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).nullable().optional(),
  category: recipeCategorySchema,
  servings: z.number().int().positive("Servings must be positive"),
  prepTimeMinutes: z.number().int().nonnegative(),
  cookingInstructions: z.string().nullable().optional(),
  sellingPrice: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v),
    z.number().optional(),
  ),
  currency: z.string().length(3).default("USD"),
  targetCostPercentage: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v),
    z.number().min(0).max(100).optional(),
  ),
  wasteBufferPercentage: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v),
    z.number().min(0).max(100).optional().default(0),
  ),
  allergens: z.array(z.string()).optional().default([]),
  dietaryRestrictions: z.array(z.string()).optional().default([]),
  calories: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v),
    z.number().int().nonnegative().optional(),
  ),
  yieldAmount: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v),
    z.number().positive().optional(),
  ),
  yieldUnit: z.string().max(50).nullable().optional(),
  isBaseRecipe: z.boolean().optional().default(false),
});

export const recipeIngredientFormSchema = z.object({
  ingredientId: z.number().int().positive().nullable(),
  subRecipeId: z.number().int().positive().nullable().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit required"),
  // UI Helpers
  name: z.string().optional(),
  price: z.number().optional(),
  ingredientUnit: z.string().optional(),
  isSubRecipe: z.boolean().optional().default(false),
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
  currency: z.string().length(3).optional(),
  reference: z.string().max(100).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});
