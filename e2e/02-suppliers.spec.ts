import { expect, test } from "./fixtures";
import { capturePageScreenshot, waitForPageReady } from "./helpers/screenshots";

test.describe("Phase 2: Supplier Management", () => {
    test("should display suppliers page with seeded data", async ({ page }) => {
        await page.goto("/");
        await waitForPageReady(page);

        // Navigate to Suppliers page
        await page.getByRole("link", { name: "Suppliers" }).click();
        await waitForPageReady(page);

        // Verify page header
        await expect(page.getByRole("heading", { name: "Suppliers" })).toBeVisible();

        // Verify Add Supplier button
        await expect(
            page.getByRole("button", { name: "Add Supplier" }),
        ).toBeVisible();

        // Verify seeded suppliers are displayed
        await expect(page.getByText("Fresh Produce Co.")).toBeVisible();
        await expect(page.getByText("Quality Meats Inc.")).toBeVisible();

        // Capture screenshot
        await capturePageScreenshot(page, "02-suppliers-page");
    });

    test("should create a new supplier", async ({ page, database }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Suppliers" }).click();
        await waitForPageReady(page);

        // Click Add Supplier button
        await page.getByRole("button", { name: "Add Supplier" }).click();

        // Fill out form
        await page.getByLabel("Name").fill("Test Supplier Ltd.");
        await page.getByLabel("Contact Person").fill("Jane Doe");
        await page.getByLabel("Email").fill("jane@testsupplier.com");
        await page.getByLabel("Phone").fill("555-9999");

        // Submit form
        await page.getByRole("button", { name: "Save" }).click();

        // Verify supplier was added to UI
        await expect(page.getByText("Test Supplier Ltd.")).toBeVisible();

        // Verify supplier was added to database
        const supplier = database.db
            .prepare("SELECT * FROM suppliers WHERE name = ?")
            .get("Test Supplier Ltd.") as any;

        expect(supplier).toBeTruthy();
        expect(supplier.contact_person).toBe("Jane Doe");
        expect(supplier.email).toBe("jane@testsupplier.com");

        // Capture screenshot
        await capturePageScreenshot(page, "02-supplier-created");
    });

    test("should edit an existing supplier", async ({ page, database }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Suppliers" }).click();
        await waitForPageReady(page);

        // Find and click edit button for first supplier
        const editButton = page.getByRole("button", { name: "Edit" }).first();
        await editButton.click();

        // Update phone number
        const phoneInput = page.getByLabel("Phone");
        await phoneInput.clear();
        await phoneInput.fill("555-1111");

        // Save changes
        await page.getByRole("button", { name: "Save" }).click();

        // Verify UI updated
        await expect(page.getByText("555-1111")).toBeVisible();

        // Capture screenshot
        await capturePageScreenshot(page, "02-supplier-edited");
    });

    test("should delete a supplier", async ({ page, database }) => {
        await page.goto("/");
        await page.getByRole("link", { name: "Suppliers" }).click();
        await waitForPageReady(page);

        // Count initial suppliers
        const initialCount = database.db
            .prepare("SELECT COUNT(*) as count FROM suppliers")
            .get() as { count: number };

        // Click delete button for a supplier without dependencies
        // (Make sure to delete one that's not linked to ingredients)
        await page.getByRole("button", { name: "Delete" }).last().click();

        // Confirm deletion (if there's a confirmation dialog)
        const confirmButton = page.getByRole("button", { name: "Confirm" });
        if (await confirmButton.isVisible()) {
            await confirmButton.click();
        }

        // Wait for deletion to process
        await page.waitForTimeout(500);

        // Verify database count decreased
        const newCount = database.db
            .prepare("SELECT COUNT(*) as count FROM suppliers")
            .get() as { count: number };

        expect(newCount.count).toBe(initialCount.count - 1);

        // Capture screenshot
        await capturePageScreenshot(page, "02-supplier-deleted");
    });
});
