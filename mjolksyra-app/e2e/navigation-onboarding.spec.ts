import { expect, test } from "@playwright/test";

test.describe("Navigation onboarding affordance", () => {
  test("shows onboard action when user still has a role to set up", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=navigation-navigation--needs-onboarding",
    );

    await expect(page.getByRole("link", { name: /onboard/i })).toBeVisible();
  });

  test("hides onboard action when user is fully onboarded", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=navigation-navigation--fully-onboarded",
    );

    await expect(page.getByRole("link", { name: /onboard/i })).toHaveCount(0);
  });
});
