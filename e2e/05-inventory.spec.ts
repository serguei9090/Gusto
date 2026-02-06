import { expect, test } from "./fixtures";
import { capturePageScreenshot, waitForPageReady } from "./helpers/screenshots";

test.describe("Phase 5: Inventory Transactions", () => {
  test("should display inventory page", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // Navigate to Inventory page
    await page.getByRole("link", { name: "Inventory" }).click();
    await waitForPageReady(page);

    // Verify page header
    await expect(
      page.getByRole("heading", { name: "Inventory" }),
    ).toBeVisible();

    // Capture screenshot
    await capturePageScreenshot(page, "05-inventory-page");
  });

  test("should log purchase transaction and update stock", async ({
    page,
    database,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Inventory" }).click();
    await waitForPageReady(page);

    // Get current stock level for Tomatoes
    const beforeStock = database.db
      .prepare("SELECT current_stock FROM ingredients WHERE name = ?")
      .get("Tomatoes") as { current_stock: number };

    // Find Tomatoes row and click "Record Transaction"
    const tomatoesRow = page.locator("tr:has-text('Tomatoes')");
    await tomatoesRow.getByRole("button", { name: /record/i }).click();

    // Fill transaction form
    await page
      .locator('select[name="transactionType"]')
      .selectOption("purchase");
    await page.getByLabel(/quantity/i).fill("10");
    await page.getByLabel(/cost.*unit/i).fill("3.50");
    await page.getByLabel(/reference/i).fill("PO-12345");

    // Submit transaction
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(500);

    // Verify stock was updated in database
    const afterStock = database.db
      .prepare("SELECT current_stock FROM ingredients WHERE name = ?")
      .get("Tomatoes") as { current_stock: number };

    expect(afterStock.current_stock).toBe(beforeStock.current_stock + 10);

    // Verify transaction was logged
    const transaction = database.db
      .prepare(`
        SELECT * FROM inventory_transactions
        WHERE ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tomatoes')
        AND reference = 'PO-12345'
      `)
      .get() as { transaction_type: string };

    expect(transaction).toBeTruthy();
    expect(transaction.transaction_type).toBe("purchase");

    // Capture screenshot
    await capturePageScreenshot(page, "05-purchase-transaction");
  });

  test("should log usage transaction and decrease stock", async ({
    page,
    database,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Inventory" }).click();
    await waitForPageReady(page);

    // Get current stock
    const beforeStock = database.db
      .prepare("SELECT current_stock FROM ingredients WHERE name = ?")
      .get("Chicken Breast") as { current_stock: number };

    // Record usage
    const chickenRow = page.locator("tr:has-text('Chicken Breast')");
    await chickenRow.getByRole("button", { name: /record/i }).click();

    await page.locator('select[name="transactionType"]').selectOption("usage");
    await page.getByLabel(/quantity/i).fill("5");
    await page.getByLabel(/notes/i).fill("Used for lunch service");

    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(500);

    // Verify stock decreased
    const afterStock = database.db
      .prepare("SELECT current_stock FROM ingredients WHERE name = ?")
      .get("Chicken Breast") as { current_stock: number };

    expect(afterStock.current_stock).toBe(beforeStock.current_stock - 5);

    // Capture screenshot
    await capturePageScreenshot(page, "05-usage-transaction");
  });

  test("should detect and display low stock items", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Inventory" }).click();
    await waitForPageReady(page);

    // Mozzarella Cheese is seeded with stock below minimum (3 < 5)
    // Verify it's highlighted as low stock
    const lowStockBadge = page.locator(
      "[data-testid='low-stock'], .low-stock, .text-destructive",
    );

    // Should see at least 1 low stock indicator (Mozzarella)
    await expect(lowStockBadge.first()).toBeVisible();

    // Verify Low Stock card shows count
    const lowStockCard = page.locator(":has-text('Low Stock')");
    await expect(lowStockCard).toBeVisible();

    // Capture screenshot showing low stock alerts
    await capturePageScreenshot(page, "05-low-stock-alert");
  });
});
