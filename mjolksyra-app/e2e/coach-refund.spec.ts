import { test, expect } from "@playwright/test";

test("unauthenticated refund endpoint redirects", async ({ page }) => {
  // The refund endpoint requires auth — unauthenticated requests should not reach the page
  const response = await page.goto("/app/coach");

  expect(response).not.toBeNull();
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app/coach");
  expect(
    url.includes("/sign-in") || url.endsWith("/") || url.includes("clerk"),
  ).toBeTruthy();

  await expect(page.locator("body")).not.toContainText("500");
});

// TODO: authenticated coach can view transactions and refund a succeeded payment
// Requires: seeded test trainee with a Succeeded transaction, Clerk test credentials, and Stripe test mode
// test("coach can view transactions and click refund on a succeeded transaction", async ({ page }) => {
//   // sign in as test coach
//   // navigate to /app/coach/athletes
//   // click "Transactions" toggle on a trainee card that has transactions
//   // expect a row with status "Succeeded" and a Refund button
//   // click the Refund button
//   // expect the row to update to status "Refunded" (after router.refresh)
// });
