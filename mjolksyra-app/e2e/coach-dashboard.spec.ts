import { test, expect } from "@playwright/test";

test("unauthenticated /app/coach does not 500 and redirects", async ({ page }) => {
  const response = await page.goto("/app/coach");

  expect(response).not.toBeNull();
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app/coach");
  expect(url.includes("/sign-in") || url.endsWith("/") || url.includes("clerk")).toBeTruthy();

  await expect(page.locator("body")).not.toContainText("500");
});

// TODO: authenticated newly-onboarded coach sees trial banner on /app/coach
// Requires: seeded test coach with TrialEndsAt set in the future in MongoDB, and Clerk test credentials
// test("newly-onboarded coach sees free trial banner on dashboard", async ({ page }) => {
//   // sign in as test coach
//   // navigate to /app/coach
//   // expect banner text to be visible
//   await expect(
//     page.getByText(/you are on a free trial/i)
//   ).toBeVisible();
// });
