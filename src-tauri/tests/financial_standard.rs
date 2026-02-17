#[cfg(test)]
mod tests {
    use rust_decimal::Decimal;
    use rust_decimal_macros::dec;
    use app_lib::financial::{calculate_standard_cost, StandardCostInput, IngredientInput, LaborStep, OverheadSettings};

    #[test]
    fn test_bocadito_queso_standard_costing() {
        // Based on "Bocadito Queso" Sheet but normalized to Standard Costing
        // Target: Raw Material $145.51
        // Labor: $166.00 (Prep $60, Cook $90, Plate $16)
        // Taxes: 19% of $166 = $31.54
        // Overhead: 100% of Labor = $166.00
        
        // 1. Setup Ingredients
        let ingredients = vec![
            IngredientInput {
                quantity: dec!(1),
                cost_per_unit: dec!(30.00),
                yield_percent: None, // Bread
            },
            IngredientInput {
                // Cheese 60g net from 935g pack @ $1800
                // Cost per g = 1800 / 935 = 1.9251...
                // 60 * 1.9251 = 115.51
                quantity: dec!(60),
                cost_per_unit: dec!(1.925133), 
                yield_percent: None,
            }
        ];

        // 2. Setup Labor Steps (All set to is_production=true for Standard Model)
        let labor_steps = vec![
            LaborStep {
                name: "Prepare raw materials".to_string(),
                workers: dec!(1),
                time_minutes: dec!(24), // 0.4 hours
                hourly_rate: dec!(150.00),
                is_production: true,
            },
            LaborStep {
                name: "Product elaboration".to_string(),
                workers: dec!(1),
                time_minutes: dec!(27), // 0.45 hours
                hourly_rate: dec!(200.00),
                is_production: true,
            },
            LaborStep {
                name: "Plating/Serving".to_string(),
                workers: dec!(1),
                time_minutes: dec!(9.6), // 0.16 hours
                hourly_rate: dec!(100.00),
                is_production: true, // Treated as Direct Labor in Standard Model
            }
        ];

        // 3. Setup Overheads
        let overheads = OverheadSettings {
            // "Industrial" Overhead rule: 100% of Direct Labor
            variable_overhead_rate: dec!(1.0), 
            fixed_overhead_buffer: dec!(0), // Not using fixed markup for this test
            labor_tax_rates: vec![
                dec!(0.14), // Social Security
                dec!(0.05), // Labor Force Tax
            ],
        };

        let input = StandardCostInput {
            ingredients,
            labor_steps,
            overheads,
            waste_buffer_percent: Some(dec!(0)),
        };

        // 4. Calculate
        let result = calculate_standard_cost(input);

        // 5. Assertions
        println!("Result: {:?}", result);

        // Raw Materials: 30 + 115.51 = 145.51
        assert_eq!(result.raw_materials.round_dp(2), dec!(145.51));

        // Direct Labor: 
        // Prep: 0.4 * 150 = 60
        // Cook: 0.45 * 200 = 90
        // Plate: 0.16 * 100 = 16
        // Total: 166.00
        assert_eq!(result.direct_labor.round_dp(2), dec!(166.00));

        // Labor Taxes: 19% of 166 = 31.54
        assert_eq!(result.labor_taxes.round_dp(2), dec!(31.54));

        // Prime Cost: 145.51 + 166 = 311.51
        assert_eq!(result.prime_cost.round_dp(2), dec!(311.51));

        // Variable Overhead: 100% of Labor = 166.00
        assert_eq!(result.variable_overhead.round_dp(2), dec!(166.00));

        // Total Cost of Goods: 311.51 (Prime) + 166 (VO) = 477.51
        assert_eq!(result.total_cost_of_goods.round_dp(2), dec!(477.51));

        // Fully Loaded: 477.51 + 31.54 (Taxes) = 509.05
        assert_eq!(result.fully_loaded_cost.round_dp(2), dec!(509.05));
    }
}
