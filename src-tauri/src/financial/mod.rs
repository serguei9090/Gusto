// Standards-compliant Financial Engine
// Supports both Prime Cost (Operational) and Full Costing (Pricing) models.

use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};

// --- Common / Standard Types ---

#[derive(Debug, Serialize, Deserialize)]
pub struct CostBreakdown {
    pub raw_materials: Decimal,
    pub direct_labor: Decimal,
    pub labor_taxes: Decimal, // New field
    pub prime_cost: Decimal,  // RM + DL
    pub variable_overhead: Decimal,
    pub fixed_overhead: Decimal,
    pub total_cost_of_goods: Decimal, // Prime + VO (Factory Cost)
    pub fully_loaded_cost: Decimal,   // TCOG + FO + Taxes
    
    // Legacy mapping helpers (optional, or we just map logic)
    // We can keep the struct generic enough or use a separate Legacy output?
    // Let's use this comprehensive struct for the new output, 
    // and keep a separate one for the legacy if strictly needed, 
    // but better to align types if possible. 
    // For now, let's keep the NEW struct clean and create a separate Legacy struct to avoid breaking changes.
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LegacyCostBreakdown {
    pub rm: Decimal,         
    pub dl: Decimal,         
    pub vo: Decimal,         
    pub fo: Decimal,         
    pub prime_cost: Decimal, 
    pub total_cost: Decimal, 
}

#[derive(Debug, Deserialize)]
pub struct IngredientInput {
    pub quantity: Decimal,
    pub cost_per_unit: Decimal,
    pub yield_percent: Option<Decimal>,
}

#[derive(Debug, Deserialize)]
pub struct LaborStep {
    pub name: String,
    pub workers: Decimal,
    pub time_minutes: Decimal,
    pub hourly_rate: Decimal,
    pub is_production: bool, 
}

#[derive(Debug, Deserialize)]
pub struct OverheadSettings {
    pub variable_overhead_rate: Decimal,
    pub fixed_overhead_buffer: Decimal,
    pub labor_tax_rates: Vec<Decimal>,
}

#[derive(Debug, Deserialize)]
pub struct StandardCostInput {
    pub ingredients: Vec<IngredientInput>,
    pub labor_steps: Vec<LaborStep>,
    pub overheads: OverheadSettings,
    pub waste_buffer_percent: Option<Decimal>,
}

// --- Legacy Types ---
#[derive(Debug, Deserialize)]
pub struct LegacyCostInput {
    pub ingredients: Vec<IngredientInput>,
    pub labor_rate_hourly: Decimal,
    pub prep_time_minutes: Decimal,
    pub utility_burn_rate_min: Decimal,
    pub fixed_overhead_percent: Decimal,
    pub waste_buffer_percent: Decimal,
}

// --- Commands ---

#[tauri::command]
pub fn calculate_standard_cost(input: StandardCostInput) -> CostBreakdown {
    // 1. Raw Materials
    let mut raw_rm = dec!(0);
    for ing in input.ingredients {
        let yield_factor = ing.yield_percent.unwrap_or(dec!(1));
        // Avoid division by zero
        let cost = if yield_factor.is_zero() {
             dec!(0) 
        } else {
            (ing.quantity * ing.cost_per_unit) / yield_factor
        };
        raw_rm += cost;
    }
    
    // Apply general waste buffer
    let waste_buffer = input.waste_buffer_percent.unwrap_or(dec!(0));
    let rm = raw_rm * (dec!(1) + waste_buffer);

    // 2. Direct Labor
    let mut dl = dec!(0);
    let mut service_labor = dec!(0);

    for step in input.labor_steps {
        let hours = step.time_minutes / dec!(60);
        let cost = step.workers * hours * step.hourly_rate;
        
        if step.is_production {
            dl += cost;
        } else {
            service_labor += cost;
        }
    }

    // 3. Labor Taxes
    let mut labor_taxes = dec!(0);
    for rate in input.overheads.labor_tax_rates {
        labor_taxes += dl * rate;
    }

    // 4. Prime Cost
    let prime_cost = rm + dl;

    // 5. Variable Overhead
    let vo = dl * input.overheads.variable_overhead_rate;

    // 6. Total Cost of Goods (TCOG)
    let tcog = prime_cost + vo;

    // 7. Fixed Overhead
    let fo = tcog * input.overheads.fixed_overhead_buffer;
    
    // 8. Fully Loaded
    let fully_loaded = tcog + fo + labor_taxes;

    CostBreakdown {
        raw_materials: rm.round_dp(4),
        direct_labor: dl.round_dp(4),
        labor_taxes: labor_taxes.round_dp(4),
        prime_cost: prime_cost.round_dp(4),
        variable_overhead: vo.round_dp(4),
        fixed_overhead: fo.round_dp(4),
        total_cost_of_goods: tcog.round_dp(4),
        fully_loaded_cost: fully_loaded.round_dp(4),
    }
}

#[tauri::command]
pub fn calculate_recipe_cost(input: LegacyCostInput) -> LegacyCostBreakdown {
    // 1. Raw Materials
    let mut raw_rm = dec!(0);
    for ing in input.ingredients {
        raw_rm += ing.quantity * ing.cost_per_unit;
    }
    
    let waste_multiplier = dec!(1) + input.waste_buffer_percent;
    let rm = raw_rm * waste_multiplier;

    // 2. Direct Labor
    let minutes_per_hour = dec!(60);
    let labor_cost_per_minute = input.labor_rate_hourly / minutes_per_hour;
    let dl = labor_cost_per_minute * input.prep_time_minutes;

    // 3. Variable Overhead
    let vo = input.utility_burn_rate_min * input.prep_time_minutes;

    // 4. Prime Cost
    let prime_cost = rm + dl;

    // 5. Fixed Overhead
    let base_for_overhead = prime_cost + vo;
    let total_cost = base_for_overhead * (dec!(1) + input.fixed_overhead_percent);
    let fo = total_cost - base_for_overhead;

    LegacyCostBreakdown {
        rm: rm.round_dp(4),
        dl: dl.round_dp(4),
        vo: vo.round_dp(4),
        fo: fo.round_dp(4),
        prime_cost: prime_cost.round_dp(4),
        total_cost: total_cost.round_dp(4),
    }
}
