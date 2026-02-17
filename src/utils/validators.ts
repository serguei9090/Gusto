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
  currentPrice: z
    .preprocess(
      (v) => (v === "" || v === null || Number.isNaN(v) ? 0 : v),
      z.coerce.number().nonnegative(),
    )
    .default(0),
  pricePerUnit: z
    .preprocess(
      (v) => (v === "" || v === null || Number.isNaN(v) ? 0 : v),
      z.coerce.number().nonnegative(),
    )
    .default(0),
  currency: z.string().length(3).default("USD"),
  supplierId: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? null : v),
    z.coerce.number().int().positive().nullable().optional(),
  ),
  minStockLevel: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? null : v),
    z.coerce.number().nonnegative().nullable().optional(),
  ),
  currentStock: z
    .preprocess(
      (v) => (v === "" || v === null || Number.isNaN(v) ? 0 : v),
      z.coerce.number().nonnegative(),
    )
    .default(0),
  notes: z.string().max(500).nullable().optional(),
  purchaseUnit: z.string().max(50).nullable().optional(),
  conversionRatio: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? null : v),
    z.coerce.number().positive().nullable().optional(),
  ),
});

// Update Ingredient Schema (all fields optional)
export const updateIngredientSchema = createIngredientSchema.partial();

// Recipe Category
export const recipeCategorySchema = z.string().optional();

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
  servings: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v),
    z.number().int().positive("Servings must be positive").optional(),
  ),
  prepTimeMinutes: z.preprocess(
    (v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v),
    z.number().int().nonnegative().optional(),
  ),
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

export const laborStepSchema = z.object({
  name: z.string().min(1, "Description required"),
  workers: z.number().min(1, "At least 1 worker"),
  time_minutes: z.number().min(0),
  hourly_rate: z.number().min(0),
  is_production: z.boolean().default(true),
});

export const overheadSettingsSchema = z.object({
  variable_overhead_rate: z.number().min(0).default(0),
  fixed_overhead_buffer: z.number().min(0).default(0),
  labor_tax_rates: z.array(z.number()).default([]),
});

export const recipeFormSchema = createRecipeSchema
  .extend({
    ingredients: z.array(recipeIngredientFormSchema).default([]),
    laborSteps: z.array(laborStepSchema).optional().default([]),
    overheads: overheadSettingsSchema.optional().default({
      variable_overhead_rate: 0,
      fixed_overhead_buffer: 0,
      labor_tax_rates: [],
    }),
  })
  .refine((data) => data.ingredients.length > 0, {
    message: "At least one ingredient is required",
    path: ["ingredients"],
  });

// Asset Type Enum
export const assetTypeSchema = z.enum([
  "operational",
  "equipment",
  "disposable",
]);

// Create Asset Schema
export const createAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  category: z.string().optional(),
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
  assetType: assetTypeSchema.default("operational"),
});

// Update Asset Schema (all fields optional)
export const updateAssetSchema = createAssetSchema.partial();

// Create Inventory Transaction Schema (supports both ingredients and assets)
export const createTransactionSchema = z
  .object({
    ingredientId: z.number().int().positive().optional(),
    assetId: z.number().int().positive().optional(),
    itemType: z.enum(["ingredient", "asset"]).optional(),
    transactionType: transactionTypeSchema,
    quantity: z.number(),
    costPerUnit: z
      .preprocess(
        (v) => (v === "" || v === null || Number.isNaN(v) ? 0 : v),
        z.coerce.number().nonnegative(),
      )
      .nullable()
      .optional(),
    totalCost: z.number().nullable().optional(),
    currency: z.string().length(3).optional(),
    reference: z.string().max(100).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
  })
  .refine((data) => data.ingredientId || data.assetId, {
    message: "Either ingredientId or assetId is required",
    path: ["ingredientId"],
  });

export type InventoryTransactionInput = z.infer<typeof createTransactionSchema>;
