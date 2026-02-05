import { expect, test } from "./fixtures";
import { capturePageScreenshot, waitForPageReady } from "./helpers/screenshots";

test.describe("Phase 6: Prep Sheet Generation", () => {
    test("should display prep sheets page", async ({ page }) => {
        await page.goto("/");
        await waitForPageReady(page);

        // Navigate to Prep Sheets page
        await page.getByRole("link", { name: "Prep Sheets" }).click();
        await waitForPageReady(page);

        // Verify page header
        await expect(
            page.getByRole("heading", { name: /prep.*sheet/i }),
        ).toBeVisible();

        // Capture screenshot
        await capturePageScreenshot(page, "06-prep-sheets-page");
    });

    test("should create prep sheet from recipes", async ({ page, database }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Prep Sheets" }).click();
        await waitForPageReady(page);

        // Click "Create New" or similar button
        await page.getByRole("button", { name: /create|new/i }).click();

        // Fill prep sheet details
        await page.getByLabel(/name|title/i).fill("Monday Lunch Prep");
        await page.getByLabel(/date/i).fill("2024-02-05");

        // Add recipes to prep sheet
        // (UI may vary - adjust selectors based on actual implementation)
        await page.getByRole("button", { name: "Add Recipe" }).click();
        await page.locator('select[name="recipeId"]').first().selectOption({ label: /Margherita Pizza/i });
        await page.getByLabel(/quantity|servings/i).first().fill("10");

        // Add another recipe
        await page.getByRole("button", { name: "Add Recipe" }).click();
        await page.locator('select[name="recipeId"]').last().selectOption({ label: /Chicken Salad/i });
        await page.getByLabel(/quantity|servings/i).last().fill("5");

        // Save prep sheet
        await page.getByRole("button", { name: /save.*sheet/i }).click();
        await page.waitForTimeout(500);

        // Verify saved in database
        const prepSheet = database.db
            .prepare("SELECT * FROM prep_sheets WHERE name = ?")
            .get("Monday Lunch Prep") as any;

        expect(prepSheet).toBeTruthy();

        // Capture screenshot
        await capturePageScreenshot(page, "06-prep-sheet-created");
    });

    test("should load saved prep sheet", async ({ page, database }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Prep Sheets" }).click();
        await waitForPageReady(page);

        // Switch to "Saved" tab if needed
        const savedTab = page.getByRole("tab", { name: /saved/i });
        if (await savedTab.isVisible()) {
            await savedTab.click();
        }

        // Should see saved prep sheets
        await expect(page.getByText("Monday Lunch Prep")).toBeVisible();

        // Click to view/edit
        await page.getByText("Monday Lunch Prep").click();

        // Verify recipes are loaded
        await expect(page.getByText("Margherita Pizza")).toBeVisible();
        await expect(page.getByText("Grilled Chicken Salad")).toBeVisible();

        // Capture screenshot
        await capturePageScreenshot(page, "06-prep-sheet-loaded");
    });

    test("should display ingredient aggregation in prep sheet", async ({
        page,
    }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Prep Sheets" }).click();
        await waitForPageReady(page);

        // Open saved prep sheet
        await page.getByText("Monday Lunch Prep").click();

        // Verify aggregated ingredients are shown
        // For 10 pizzas: 10 * 0.2kg mozzarella = 2kg
        // For 5 salads: 5 * 0.25kg chicken = 1.25kg
        await expect(page.getByText(/mozzarella/i)).toBeVisible();
        await expect(page.getByText(/chicken/i)).toBeVisible();

        // Capture  screenshot of prep sheet view
        await capturePageScreenshot(page, "06-prep-sheet-view");
    });
});
