import { Generated } from 'kysely'

export interface IngredientTable {
    id: Generated<number>
    name: string
    category: string
    unit_of_measure: string
    current_price: number
    price_per_unit: number
    supplier_id: number | null
    min_stock_level: number | null
    current_stock: number | null
    last_updated: string | null
    notes: string | null
}

export interface RecipeTable {
    id: Generated<number>
    name: string
    description: string | null
    category: string | null
    servings: number
    prep_time_minutes: number | null
    cooking_instructions: string | null
    selling_price: number | null
    target_cost_percentage: number | null
    total_cost: number | null
    profit_margin: number | null
    created_at: string | null
    updated_at: string | null
}

export interface RecipeIngredientTable {
    id: Generated<number>
    recipe_id: number
    ingredient_id: number
    quantity: number
    unit: string
    cost: number | null
    notes: string | null
}

export interface SupplierTable {
    id: Generated<number>
    name: string
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    payment_terms: string | null
    notes: string | null
    created_at: string | null
}

export interface InventoryTransactionTable {
    id: Generated<number>
    ingredient_id: number
    transaction_type: 'IN' | 'OUT' | 'ADJUST' | 'audit' | 'restock' | 'usage' | 'waste' // Matching existing types
    quantity: number
    cost_per_unit: number | null
    total_cost: number | null
    reference: string | null
    notes: string | null
    created_at: string | null
}

export interface PriceHistoryTable {
    id: Generated<number>
    ingredient_id: number
    price: number
    supplier_id: number | null
    recorded_at: string | null
}

export interface PrepSheetTable {
    id: Generated<number>
    name: string
    date: string
    shift: string | null
    prep_cook_name: string | null
    notes: string | null
    recipes_json: string // Stored as JSON string
    items_json: string   // Stored as JSON string
    created_at: string | null
}

export interface Database {
    ingredients: IngredientTable
    recipes: RecipeTable
    recipe_ingredients: RecipeIngredientTable
    suppliers: SupplierTable
    inventory_transactions: InventoryTransactionTable
    price_history: PriceHistoryTable
    prep_sheets: PrepSheetTable
}
