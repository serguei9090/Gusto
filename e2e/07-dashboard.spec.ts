import { expect, test } from "./fixtures";
import { capturePageScreenshot, waitForPageReady } from "./helpers/screenshots";

test.describe("Phase 7: Dashboard & Reporting", () => {
    test("should display dashboard with stats", async ({ page }) => {
        await page.goto("/");
        await waitForPageReady(page);

        // Should be on dashboard by default
        await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

        // Verify stats cards are visible
        await expect(page.getByText(/stock value/i)).toBeVisible();
        await expect(page.getByText(/low stock/i)).toBeVisible();
        await expect(page.getByText(/avg.*margin/i)).toBeVisible();
        await expect(page.getByText(/total recipes/i)).toBeVisible();

        // Capture screenshot
        await capturePageScreenshot(page, "07-dashboard-overview");
    });

    test("should calculate total inventory value", async ({
        page,
        database,
    }) => {
        await page.goto("/");
        await waitForPageReady(page);

        // Calculate expected value from database
        const result = database.db
            .prepare(
                "SELECT SUM(current_stock * current_price) as total FROM ingredients",
            )
            .get() as { total: number };

        const expectedValue = result.total || 0;

        // Find inventory value stat on dashboard
        const valueText = await page
            .locator("[data-testid='inventory-value'], :has-text('Stock Value')")
            .textContent();

        // Extract number from text
        const displayedValue = parseFloat(
            valueText?.replace(/[^0-9.]/g, "") || "0",
        );

        // Verify values match (allow small variance for float calculations)
        expect(Math.abs(displayedValue - expectedValue)).toBeLessThan(1);

        // Capture screenshot
        await capturePageScreenshot(page, "07-inventory-value");
    });

    test("should display urgent reorders widget", async ({ page }) => {
        await page.goto("/");
        await waitForPageReady(page);

        // Verify urgent reorders section exists
        await expect(page.getByText(/urgent.*reorder/i)).toBeVisible();

        // Mozzarella should appear (current: 3, min: 5)
        await expect(page.getByText("Mozzarella Cheese")).toBeVisible();

        // Capture screenshot
        await capturePageScreenshot(page, "07-urgent-reorders");
    });

    test("should display top recipes by margin", async ({ page }) => {
        await page.goto("/");
        await waitForPageReady(page);

        // Verify top recipes section
        await expect(page.getByText(/top recipes/i)).toBeVisible();

        // Should see seeded recipes
        const recipesSection = page.locator(":has-text('Top Recipes')");
        await expect(recipesSection).toBeVisible();

        // Capture screenshot
        await capturePageScreenshot(page, "07-top-recipes");
    });

    test("should verify average profit margin calculation", async ({
        page,
        database,
    }) => {
        await page.goto("/");
        await waitForPageReady(page);

        // Calculate expected average margin
        const recipes = database.db
            .prepare(
                "SELECT target_cost_percentage FROM recipes WHERE target_cost_percentage IS NOT NULL",
            )
            .all() as Array<{ target_cost_percentage: number }>;

        if (recipes.length > 0) {
            const avgCostPercentage =
                recipes.reduce((sum, r) => sum + r.target_cost_percentage, 0) /
                recipes.length;
            const expectedMargin = 100 - avgCostPercentage;

            // Find displayed margin
            const marginText = await page
                .locator(
                    "[data-testid='avg-margin'], :has-text('Avg'):has-text('Margin')",
                )
                .textContent();

            const displayedMargin = parseFloat(
                marginText?.replace(/[^0-9.]/g, "") || "0",
            );

            // Verify calculation
            expect(Math.abs(displayedMargin - expectedMargin)).toBeLessThan(0.1);
        }

        // Capture screenshot
        await capturePageScreenshot(page, "07-profit-margin");
    });
});
