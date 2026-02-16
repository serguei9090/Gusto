# Restaurant Math Standards

## Actual vs. Theoretical (AvT)
The gold standard for BOH costing.

- **Actual Food Cost**: `(Opening Inventory + Purchases) - Closing Inventory`
- **Theoretical Cost**: `Menu Item Sales × Recipe Cost`
- **Variance**: `Actual - Theoretical`

## Unit Conversions
Professional RMS must handle the "Unit Mapping Problem":
- **Purchase Unit (PU)**: How it's bought (Case, Flat, Bag).
- **Stock Unit (SU)**: How it's counted (LB, KG, EA).
- **Recipe Unit (RU)**: How it's used (Gram, Oz, TBSP).

**Logic Requirement**: Check for `conversion_ratio` and `base_unit` mapping in the database.

## Yield & Waste
- **Raw Weight vs. Cooked Weight**: Yield factors are essential for accurate recipe costs.
- **Waste Buffer**: A percentage added to ingredient costs to account for trim and spoilage.

## Menu Engineering Matrix
Categorize items based on Contribution Margin and Popularity:
1. **Stars**: High Margin, High Popularity.
2. **Plowhorses**: Low Margin, High Popularity.
3. **Puzzles**: High Margin, Low Popularity.
4. **Dogs**: Low Margin, Low Popularity.
