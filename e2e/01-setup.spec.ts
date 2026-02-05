import { expect, test } from "./fixtures";
import { capturePageScreenshot, waitForPageReady } from "./helpers/screenshots";

test.describe("Phase 1: Application Setup", () => {
    test("should initialize database with schema", async ({ database }) => {
        // Verify tables exist
        const tables = database.db
            .prepare(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
            )
            .all();

        const tableNames = tables.map((t: any) => t.name);

        expect(tableNames).toContain("suppliers");
        expect(tableNames).toContain("ingredients");
        expect(tableNames).toContain("recipes");
        expect(tableNames).toContain("recipe_ingredients");
        expect(tableNames).toContain("inventory_transactions");
        expect(tableNames).toContain("price_history");
        expect(tableNames).toContain("prep_sheets");
    });

    test("should seed database with sample data", async ({ database }) => {
        // Verify suppliers were seeded
        const suppliers = database.db
            .prepare("SELECT COUNT(*) as count FROM suppliers")
            .get() as { count: number };
        expect(suppliers.count).toBeGreaterThan(0);

        // Verify ingredients were seeded
        const ingredients = database.db
            .prepare("SELECT COUNT(*) as count FROM ingredients")
            .get() as { count: number };
        expect(ingredients.count).toBeGreaterThan(0);
    });

    test("should launch application successfully", async ({ page }) => {
        await page.goto("/");
        await waitForPageReady(page);

        // Verify navigation is visible
        await expect(page.locator("nav")).toBeVisible({
            timeout: 15000
        });

        // Verify main navigation links
        await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Suppliers" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Ingredients" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Recipes" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Inventory" })).toBeVisible();

        // Capture screenshot of initial state
        await capturePageScreenshot(page, "01-app-launch");
    });
});
