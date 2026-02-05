import type { Page } from "@playwright/test";

/**
 * Capture a screenshot with a descriptive name
 */
export async function capturePageScreenshot(
    page: Page,
    name: string,
): Promise<void> {
    await page.screenshot({
        path: `test-results/screenshots/${name}.png`,
        fullPage: true,
    });
}

/**
 * Wait for page to be ready (no loading spinners, modals settled)
 */
export async function waitForPageReady(page: Page): Promise<void> {
    // Wait for network to be idle
    await page.waitForLoadState("networkidle");

    // Wait for any loading indicators to disappear
    const loadingIndicators = page.locator('[aria-busy="true"], .loading');
    const count = await loadingIndicators.count();
    if (count > 0) {
        await loadingIndicators.first().waitFor({ state: "hidden", timeout: 5000 });
    }
}

/**
 * Capture screenshot of a specific element
 */
export async function captureElementScreenshot(
    page: Page,
    selector: string,
    name: string,
): Promise<void> {
    const element = page.locator(selector);
    await element.screenshot({
        path: `test-results/screenshots/${name}.png`,
    });
}
