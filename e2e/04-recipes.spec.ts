import { expect, test } from "./fixtures";
import { capturePageScreenshot, waitForPageReady } from "./helpers/screenshots";

test.describe("Phase 4: Recipe Management", () => {
  test("should display recipes page with seeded data", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // Navigate to Recipes page
    await page.getByRole("link", { name: "Recipes" }).click();
    await waitForPageReady(page);

    // Verify page header
    await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();

    // Verify Add Recipe button
    await expect(
      page.getByRole("button", { name: "Add Recipe" }),
    ).toBeVisible();

    // Verify seeded recipes
    await expect(page.getByText("Margherita Pizza")).toBeVisible();
    await expect(page.getByText("Grilled Chicken Salad")).toBeVisible();

    // Capture screenshot
    await capturePageScreenshot(page, "04-recipes-page");
  });

  test("should view recipe details with cost calculations", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Recipes" }).click();
    await waitForPageReady(page);

    // Click on recipe to view details
    const recipeRow = page.locator("tr:has-text('Margherita Pizza')");
    await recipeRow.click();

    // Verify modal/detail view opened
    await expect(page.getByText("Recipe Details")).toBeVisible();

    // Verify cost information is displayed
    await expect(page.getByText(/total cost/i)).toBeVisible();
    await expect(page.getByText(/profit margin/i)).toBeVisible();

    // Verify ingredients list
    await expect(page.getByText("Mozzarella Cheese")).toBeVisible();
    await expect(page.getByText("Olive Oil")).toBeVisible();

    // Capture screenshot of detail modal
    await capturePageScreenshot(page, "04-recipe-detail");
  });

  test("should create a new recipe with ingredients", async ({
    page,
    database,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Recipes" }).click();
    await waitForPageReady(page);

    // Click Add Recipe
    await page.getByRole("button", { name: "Add Recipe" }).click();

    // Fill basic recipe info
    await page.getByLabel("Name").fill("Caesar Salad");
    await page.getByLabel("Description").fill("Classic Caesar Salad");
    await page.getByLabel(/Yield Quantity/i).fill("1");
    await page.locator('select[name="yieldUnit"]').selectOption("portion");

    // Add serving info
    await page.getByLabel(/Serving Size/i).fill("1");
    await page.getByLabel(/Selling Price/i).fill("12.00");

    // Add ingredients
    // (This depends on your UI - adjust selectors as needed)
    await page.getByRole("button", { name: "Add Ingredient" }).click();
    await page
      .locator('select[name="ingredientId"]')
      .first()
      .selectOption({ label: "Chicken Breast" });
    await page
      .getByLabel(/Quantity/i)
      .first()
      .fill("150");

    // Save recipe
    await page.getByRole("button", { name: "Save Recipe" }).click();

    // Verify recipe was created
    await expect(page.getByText("Caesar Salad")).toBeVisible();

    // Verify in database
    const recipe = database.db
      .prepare("SELECT * FROM recipes WHERE name = ?")
      .get("Caesar Salad") as { selling_price: number };

    expect(recipe).toBeTruthy();
    expect(recipe.selling_price).toBe(12);

    // Capture screenshot
    await capturePageScreenshot(page, "04-recipe-created");
  });

  test("should verify cost calculation accuracy", async ({
    page,
    database,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Recipes" }).click();
    await waitForPageReady(page);

    // Get expected cost from database
    // Margherita Pizza: 0.2kg mozzarella ($6.50/kg) + 0.1L olive oil ($12/L)
    // = $1.30 + $1.20 = $2.50 ingredient cost
    const recipeIngredients = database.db
      .prepare(`
        SELECT ri.quantity, ri.unit, i.price_per_unit, i.unit_of_measure
        FROM recipe_ingredients ri
        JOIN ingredients i ON i.id = ri.ingredient_id
        WHERE ri.recipe_id = 1
      `)
      .all() as { quantity: number; price_per_unit: number }[];

    let expectedCost = 0;
    for (const ing of recipeIngredients) {
      expectedCost += ing.quantity * ing.price_per_unit;
    }

    // Open recipe detail
    await page.locator("tr:has-text('Margherita Pizza')").click();

    // Find and verify the displayed cost matches calculation
    const costText = await page
      .locator("[data-testid='total-cost'], .total-cost")
      .textContent();
    const displayedCost = Number.parseFloat(
      costText?.replaceAll(/[^0-9.]/g, "") || "0",
    );

    // Allow small floating point variance
    expect(Math.abs(displayedCost - expectedCost)).toBeLessThan(0.01);

    // Capture screenshot
    await capturePageScreenshot(page, "04-recipe-cost-verification");
  });

  test("should export recipe to PDF", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Recipes" }).click();
    await waitForPageReady(page);

    // Open recipe detail
    await page.locator("tr:has-text('Margherita Pizza')").click();

    // Setup download listener
    const downloadPromise = page.waitForEvent("download");

    // Click PDF export button
    await page.getByRole("button", { name: /export.*pdf/i }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download happened
    expect(download.suggestedFilename()).toContain(".pdf");

    // Capture screenshot
    await capturePageScreenshot(page, "04-recipe-pdf-export");
  });
});
