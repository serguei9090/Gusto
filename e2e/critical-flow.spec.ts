import { expect, test } from "./fixtures";
import { capturePageScreenshot, waitForPageReady } from "./helpers/screenshots";

test.describe("Phase 8: Critical End-to-End Flow", () => {
  test("should complete full workflow: Supplier → Ingredient → Recipe → Inventory → Dashboard", async ({
    page,
    database,
  }) => {
    // STEP 1: Create a new supplier
    await page.goto("/");
    await page.getByRole("link", { name: "Suppliers" }).click();
    await waitForPageReady(page);

    await page.getByRole("button", { name: "Add Supplier" }).click();
    await page.getByLabel("Name").fill("E2E Test Supplier");
    await page.getByLabel("Email").fill("e2e@testsupplier.com");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("E2E Test Supplier")).toBeVisible();
    await capturePageScreenshot(page, "08-step1-supplier-created");

    // STEP 2: Create an ingredient linked to that supplier
    await page.getByRole("link", { name: "Ingredients" }).click();
    await waitForPageReady(page);

    await page.getByRole("button", { name: "Add Ingredient" }).click();
    await page.getByLabel("Name").fill("E2E Test Ingredient");
    await page.locator('select[name="category"]').selectOption("other");
    await page.locator('select[name="unitOfMeasure"]').selectOption("kg");
    await page.getByLabel(/Price.*Total/i).fill("10.00");
    await page.getByLabel(/Price.*Unit/i).fill("10.00");
    await page.getByLabel("Current Stock").fill("20");
    await page.getByLabel(/Min.*Stock/i).fill("5");

    await page
      .locator('select[name="supplierId"]')
      .selectOption({ label: "E2E Test Supplier" });

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("E2E Test Ingredient")).toBeVisible();
    await capturePageScreenshot(page, "08-step2-ingredient-created");

    // STEP 3: Create a recipe using that ingredient
    await page.getByRole("link", { name: "Recipes" }).click();
    await waitForPageReady(page);

    await page.getByRole("button", { name: "Add Recipe" }).click();
    await page.getByLabel("Name").fill("E2E Test Recipe");
    await page.getByLabel("Description").fill("End-to-end test recipe");
    await page.getByLabel(/Yield Quantity/i).fill("1");
    await page.locator('select[name="yieldUnit"]').selectOption("portion");
    await page.getByLabel(/Selling Price/i).fill("25.00");
    await page.getByLabel(/Target Cost/i).fill("30");

    // Add the ingredient
    await page.getByRole("button", { name: "Add Ingredient" }).click();
    await page
      .locator('select[name="ingredientId"]')
      .first()
      .selectOption({ label: "E2E Test Ingredient" });
    await page
      .getByLabel(/Quantity/i)
      .first()
      .fill("2");

    await page.getByRole("button", { name: "Save Recipe" }).click();
    await expect(page.getByText("E2E Test Recipe")).toBeVisible();
    await capturePageScreenshot(page, "08-step3-recipe-created");

    // STEP 4: Log inventory transaction
    await page.getByRole("link", { name: "Inventory" }).click();
    await waitForPageReady(page);

    const ingredientRow = page.locator("tr:has-text('E2E Test Ingredient')");
    await ingredientRow.getByRole("button", { name: /record/i }).click();

    await page.locator('select[name="transactionType"]').selectOption("usage");
    await page.getByLabel(/quantity/i).fill("5");
    await page.getByLabel(/notes/i).fill("Used in E2E test");

    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(500);

    // Verify stock was updated
    const updatedStock = database.db
      .prepare(
        "SELECT current_stock FROM ingredients WHERE name = 'E2E Test Ingredient'",
      )
      .get() as { current_stock: number };

    expect(updatedStock.current_stock).toBe(15); // 20 - 5 = 15

    await capturePageScreenshot(page, "08-step4-inventory-updated");

    // STEP 5: Verify everything reflects on Dashboard
    await page.getByRole("link", { name: "Dashboard" }).first().click();
    await waitForPageReady(page);

    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    // Verify stats are displaying
    await expect(page.getByText(/stock value/i)).toBeVisible();
    await expect(page.getByText(/total recipes/i)).toBeVisible();

    await capturePageScreenshot(page, "08-step5-dashboard-final");

    // FINAL VERIFICATION: Check data integrity across all tables
    const supplier = database.db
      .prepare("SELECT * FROM suppliers WHERE name = 'E2E Test Supplier'")
      .get() as { id: number };

    const ingredient = database.db
      .prepare("SELECT * FROM ingredients WHERE name = 'E2E Test Ingredient'")
      .get() as { id: number; supplier_id: number };

    const recipe = database.db
      .prepare("SELECT * FROM recipes WHERE name = 'E2E Test Recipe'")
      .get() as { id: number };

    const recipeIngredient = database.db
      .prepare(
        `SELECT * FROM recipe_ingredients 
         WHERE recipe_id = ? AND ingredient_id = ?`,
      )
      .get(recipe.id, ingredient.id) as { quantity: number };

    const transaction = database.db
      .prepare(
        `SELECT * FROM inventory_transactions 
         WHERE ingredient_id = ? AND notes = 'Used in E2E test'`,
      )
      .get(ingredient.id) as { transaction_type: string; quantity: number };

    // Verify all entities are properly linked
    expect(supplier).toBeTruthy();
    expect(ingredient).toBeTruthy();
    expect(ingredient.supplier_id).toBe(supplier.id);
    expect(recipe).toBeTruthy();
    expect(recipeIngredient).toBeTruthy();
    expect(recipeIngredient.quantity).toBe(2);
    expect(transaction).toBeTruthy();
    expect(transaction.transaction_type).toBe("usage");
    expect(transaction.quantity).toBe(5);

    console.log("✅ E2E Test Complete: All data verified across entities");
  });
});
