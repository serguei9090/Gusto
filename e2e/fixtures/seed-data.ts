import Database from "better-sqlite3";

export interface Supplier {
    id?: number;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
}

export interface Ingredient {
    id?: number;
    name: string;
    category: string;
    unit_of_measure: string;
    current_price: number;
    price_per_unit: number;
    supplier_id?: number;
    min_stock_level?: number;
    current_stock?: number;
    notes?: string;
}

export interface Recipe {
    id?: number;
    name: string;
    description?: string;
    yield_quantity: number;
    yield_unit: string;
    serving_size?: number;
    serving_unit?: string;
    labor_cost?: number;
    overhead_percentage?: number;
    target_cost_percentage?: number;
    selling_price?: number;
    instructions?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
}

export interface RecipeIngredient {
    recipe_id: number;
    ingredient_id: number;
    quantity: number;
    unit: string;
    notes?: string;
}

/**
 * Sample supplier data for testing
 */
export const sampleSuppliers: Supplier[] = [
    {
        name: "Fresh Produce Co.",
        contact_person: "John Smith",
        email: "john@freshproduce.com",
        phone: "555-0100",
        address: "123 Market St",
        notes: "Delivers Tuesday and Friday",
    },
    {
        name: "Quality Meats Inc.",
        contact_person: "Sarah Johnson",
        email: "sarah@qualitymeats.com",
        phone: "555-0200",
        address: "456 Industrial Ave",
    },
    {
        name: "Dairy Delights",
        contact_person: "Mike Wilson",
        email: "mike@dairydelights.com",
        phone: "555-0300",
    },
];

/**
 * Sample ingredient data for testing
 */
export const sampleIngredients: Ingredient[] = [
    {
        name: "Tomatoes",
        category: "vegetable",
        unit_of_measure: "kg",
        current_price: 3.5,
        price_per_unit: 3.5,
        supplier_id: 1,
        min_stock_level: 10,
        current_stock: 15,
    },
    {
        name: "Chicken Breast",
        category: "protein",
        unit_of_measure: "kg",
        current_price: 8.99,
        price_per_unit: 8.99,
        supplier_id: 2,
        min_stock_level: 20,
        current_stock: 25,
    },
    {
        name: "Mozzarella Cheese",
        category: "dairy",
        unit_of_measure: "kg",
        current_price: 6.5,
        price_per_unit: 6.5,
        supplier_id: 3,
        min_stock_level: 5,
        current_stock: 3, // Below minimum - should trigger low stock alert
    },
    {
        name: "Olive Oil",
        category: "condiment",
        unit_of_measure: "l",
        current_price: 12.0,
        price_per_unit: 12.0,
        supplier_id: 1,
        min_stock_level: 2,
        current_stock: 5,
    },
];

/**
 * Sample recipe data for testing
 */
export const sampleRecipes: Recipe[] = [
    {
        name: "Margherita Pizza",
        description: "Classic Italian pizza",
        yield_quantity: 1,
        yield_unit: "piece",
        serving_size: 8,
        serving_unit: "slice",
        labor_cost: 2.5,
        overhead_percentage: 15,
        target_cost_percentage: 30,
        selling_price: 18.0,
        instructions: "1. Prepare dough\n2. Add toppings\n3. Bake at 450°F",
        prep_time_minutes: 30,
        cook_time_minutes: 15,
    },
    {
        name: "Grilled Chicken Salad",
        description: "Fresh salad with grilled chicken",
        yield_quantity: 1,
        yield_unit: "portion",
        serving_size: 1,
        serving_unit: "portion",
        labor_cost: 1.5,
        overhead_percentage: 10,
        target_cost_percentage: 28,
        selling_price: 14.0,
        prep_time_minutes: 15,
        cook_time_minutes: 10,
    },
];

/**
 * Seed database with sample data
 */
export function seedDatabase(db: Database.Database): void {
    // Insert suppliers
    const supplierStmt = db.prepare(`
    INSERT INTO suppliers (name, contact_person, email, phone, address, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    for (const supplier of sampleSuppliers) {
        supplierStmt.run(
            supplier.name,
            supplier.contact_person || null,
            supplier.email || null,
            supplier.phone || null,
            supplier.address || null,
            supplier.notes || null,
        );
    }

    // Insert ingredients
    const ingredientStmt = db.prepare(`
    INSERT INTO ingredients (
      name, category, unit_of_measure, current_price, price_per_unit,
      supplier_id, min_stock_level, current_stock, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    for (const ingredient of sampleIngredients) {
        ingredientStmt.run(
            ingredient.name,
            ingredient.category,
            ingredient.unit_of_measure,
            ingredient.current_price,
            ingredient.price_per_unit,
            ingredient.supplier_id || null,
            ingredient.min_stock_level || null,
            ingredient.current_stock || 0,
            ingredient.notes || null,
        );
    }

    // Insert recipes
    const recipeStmt = db.prepare(`
    INSERT INTO recipes (
      name, description, yield_quantity, yield_unit, serving_size, serving_unit,
      labor_cost, overhead_percentage, target_cost_percentage, selling_price,
      instructions, prep_time_minutes, cook_time_minutes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    for (const recipe of sampleRecipes) {
        recipeStmt.run(
            recipe.name,
            recipe.description || null,
            recipe.yield_quantity,
            recipe.yield_unit,
            recipe.serving_size || null,
            recipe.serving_unit || null,
            recipe.labor_cost || 0,
            recipe.overhead_percentage || 0,
            recipe.target_cost_percentage || null,
            recipe.selling_price || null,
            recipe.instructions || null,
            recipe.prep_time_minutes || null,
            recipe.cook_time_minutes || null,
        );
    }

    // Add recipe ingredients (Margherita Pizza)
    const recipeIngredientStmt = db.prepare(`
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

    // Pizza: 200g mozzarella, 100ml olive oil
    recipeIngredientStmt.run(1, 3, 0.2, "kg", null);
    recipeIngredientStmt.run(1, 4, 0.1, "l", null);

    // Salad: 250g chicken, 50g tomatoes
    recipeIngredientStmt.run(2, 2, 0.25, "kg", null);
    recipeIngredientStmt.run(2, 1, 0.05, "kg", null);
}

/**
 * Clean all data from database tables
 */
export function cleanDatabase(db: Database.Database): void {
    db.exec("DELETE FROM prep_sheets");
    db.exec("DELETE FROM price_history");
    db.exec("DELETE FROM inventory_transactions");
    db.exec("DELETE FROM recipe_ingredients");
    db.exec("DELETE FROM recipes");
    db.exec("DELETE FROM ingredients");
    db.exec("DELETE FROM suppliers");
}
