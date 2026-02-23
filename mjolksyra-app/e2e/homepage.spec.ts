import { test, expect } from "@playwright/test";

test("homepage renders brand and CTA", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  await expect(page.getByText("mjölksyra")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /transform your coaching into a business/i }),
  ).toBeVisible();

  // Accept either beta signup form state or registration CTA.
  const cta = page
    .getByRole("button", { name: /get started now/i })
    .or(page.getByRole("button", { name: /join waitlist|sign up/i }));
  await expect(cta.first()).toBeVisible();
});
