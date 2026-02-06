import { expect, test } from "./fixtures";
import { capturePageScreenshot, waitForPageReady } from "./helpers/screenshots";

test.describe("Phase 3: Ingredient Management", () => {
  test("should display ingredients page with seeded data", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // Navigate to Ingredients page
    await page.getByRole("link", { name: "Ingredients" }).click();
    await waitForPageReady(page);

    // Verify page header
    await expect(
      page.getByRole("heading", { name: "Ingredients" }),
    ).toBeVisible();

    // Verify Add Ingredient button
    await expect(
      page.getByRole("button", { name: "Add Ingredient" }),
    ).toBeVisible();

    // Verify seeded ingredients are displayed
    await expect(page.getByText("Tomatoes")).toBeVisible();
    await expect(page.getByText("Chicken Breast")).toBeVisible();
    await expect(page.getByText("Mozzarella Cheese")).toBeVisible();

    //  Capture screenshot
    await capturePageScreenshot(page, "03-ingredients-page");
  });

  test("should create a new ingredient with supplier", async ({
    page,
    database,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Ingredients" }).click();
    await waitForPageReady(page);

    // Click Add Ingredient button
    await page.getByRole("button", { name: "Add Ingredient" }).click();

    // Fill out form
    await page.getByLabel("Name").fill("Basil");
    await page.locator('select[name="category"]').selectOption("spice");
    await page.locator('select[name="unitOfMeasure"]').selectOption("g");
    await page.getByLabel(/Price.*Total/i).fill("2.50");
    await page.getByLabel(/Price.*Unit/i).fill("2.50");
    await page.getByLabel("Current Stock").fill("100");
    await page.getByLabel(/Min.*Stock/i).fill("50");

    // Select supplier
    await page
      .locator('select[name="supplierId"]')
      .selectOption({ label: "Fresh Produce Co." });

    // Submit form
    await page.getByRole("button", { name: "Save" }).click();

    // Verify ingredient was added
    await expect(page.getByText("Basil")).toBeVisible();

    // Verify in database
    const ingredient = database.db
      .prepare("SELECT * FROM ingredients WHERE name = ?")
      .get("Basil") as { category: string; supplier_id: number };

    expect(ingredient).toBeTruthy();
    expect(ingredient.category).toBe("spice");
    expect(ingredient.supplier_id).toBeTruthy();

    // Capture screenshot
    await capturePageScreenshot(page, "03-ingredient-created");
  });

  test("should search/filter ingredients", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Ingredients" }).click();
    await waitForPageReady(page);

    // Type in search box
    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill("chicken");

    // Verify filtered results
    await expect(page.getByText("Chicken Breast")).toBeVisible();
    await expect(page.getByText("Tomatoes")).not.toBeVisible();

    // Clear search
    await searchBox.clear();
    await searchBox.fill("");

    // Verify all ingredients visible again
    await expect(page.getByText("Tomatoes")).toBeVisible();

    // Capture screenshot
    await capturePageScreenshot(page, "03-ingredient-search");
  });

  test("should edit ingredient pricing", async ({ page, database }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Ingredients" }).click();
    await waitForPageReady(page);

    // Click edit for Tomatoes
    const rows = page.locator("tr:has-text('Tomatoes')");
    const editButton = rows.getByRole("button", { name: "Edit" });
    await editButton.click();

    // Update price
    const priceInput = page.getByLabel(/Price.*Total/i);
    await priceInput.clear();
    await priceInput.fill("4.00");

    // Save changes
    await page.getByRole("button", { name: "Save" }).click();

    // Verify database was updated
    const ingredient = database.db
      .prepare("SELECT current_price FROM ingredients WHERE name = ?")
      .get("Tomatoes") as { current_price: number };

    expect(ingredient.current_price).toBe(4);

    // Capture screenshot
    await capturePageScreenshot(page, "03-ingredient-edited");
  });

  test("should delete an ingredient", async ({ page, database }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Ingredients" }).click();
    await waitForPageReady(page);

    // Count ingredients before deletion
    const initialCount = database.db
      .prepare("SELECT COUNT(*) as count FROM ingredients")
      .get() as { count: number };

    // Delete Olive Oil (not used in seeded recipes)
    const row = page.locator("tr:has-text('Olive Oil')");
    const deleteButton = row.getByRole("button", { name: "Delete" });
    await deleteButton.click();

    // Confirm if needed
    const confirmButton = page.getByRole("button", { name: "Confirm" });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await page.waitForTimeout(500);

    // Verify deletion in database
    const newCount = database.db
      .prepare("SELECT COUNT(*) as count FROM ingredients")
      .get() as { count: number };

    expect(newCount.count).toBe(initialCount.count - 1);

    // Capture screenshot
    await capturePageScreenshot(page, "03-ingredient-deleted");
  });
});
