import { test, expect } from "@playwright/test";

test("protected app route does not 500 and redirects when signed out", async ({ page }) => {
  const response = await page.goto("/app");

  // Depending on middleware/auth config, this may be a redirect chain.
  expect(response).not.toBeNull();

  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app");

  // Common outcomes: Clerk sign-in page or homepage fallback.
  expect(url.includes("/sign-in") || url.endsWith("/") || url.includes("clerk")).toBeTruthy();

  await expect(page.locator("body")).not.toContainText("500");
});
