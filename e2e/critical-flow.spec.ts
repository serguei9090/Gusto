import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
    test('should complete the Supplier -> Recipe -> Dashboard loop', async ({ page }) => {
        // 1. Initial Dashboard Check - Verify Sidebar/Navigation loads
        await page.goto('/');
        // Wait for the app to hydrate and show main layout
        await expect(page.locator('nav')).toBeVisible({ timeout: 15000 });

        // Check for core navigation items
        await expect(page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Recipes' })).toBeVisible();

        // 2. Navigate to Suppliers
        await page.getByRole('link', { name: 'Suppliers' }).click();
        await expect(page.getByRole('button', { name: 'Add Supplier' })).toBeVisible();

        // 3. Navigate to Recipes
        await page.getByRole('link', { name: 'Recipes' }).click();
        await expect(page.getByRole('button', { name: 'Add Recipe' })).toBeVisible();

        // 4. Return to Dashboard
        await page.getByRole('link', { name: 'Dashboard' }).first().click();
        // Just verify we are back and things exist
        await expect(page.locator('nav')).toBeVisible();
    });
});
