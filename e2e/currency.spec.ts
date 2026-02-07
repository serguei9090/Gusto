import { expect, test } from "@playwright/test";

test.describe("Currency Management", () => {
  test("should add and delete a currency", async ({ page }) => {
    // 1. Navigate to Settings -> Currencies
    await page.goto("/");
    await page.getByRole("button", { name: "Settings" }).click();
    await page
      .getByRole("button", {
        name: "Advanced Currency & Exchange Rate Management",
      })
      .click();

    // 2. Add a new currency
    await page.getByRole("button", { name: "Add Currency" }).click();

    // Fill form
    await page.locator('input[name="code"]').fill("TEST");
    await page.locator('input[name="name"]').fill("Test Currency");
    await page.locator('input[name="symbol"]').fill("T");
    await page.locator('input[name="decimal_places"]').fill("2");

    // Submit
    // Note: The submit button is inside the dialog
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add Currency" })
      .click();

    // 3. Verify it appears in the table
    await expect(
      page.getByRole("cell", { name: "TEST", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Test Currency" }),
    ).toBeVisible();

    // 4. Delete the currency
    // Click the trash icon for the TEST row
    const row = page.getByRole("row").filter({ hasText: "TEST" });
    await row.getByRole("button", { name: "Delete" }).click();

    // 5. Verify confirmation dialog
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText(
      "Are you sure you want to delete TEST?",
    );

    // 6. Confirm delete
    await page.getByRole("button", { name: "Delete", exact: true }).click(); // The destructive button in dialog

    // 7. Verify it is gone
    await expect(
      page.getByRole("cell", { name: "TEST", exact: true }),
    ).not.toBeVisible();
  });
});
