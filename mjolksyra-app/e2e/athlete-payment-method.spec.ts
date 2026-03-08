import { test, expect } from "@playwright/test";

// ── Unauthenticated redirects ────────────────────────────────────────────────
// These tests run immediately without seeded data or Clerk credentials.

test("athlete app route redirects unauthenticated users away from /app/athlete", async ({ page }) => {
  const response = await page.goto("/app/athlete");

  expect(response).not.toBeNull();
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app/athlete");
  expect(
    url.includes("/sign-in") || url.endsWith("/") || url.includes("clerk")
  ).toBeTruthy();

  await expect(page.locator("body")).not.toContainText("500");
});

test("athlete settings route redirects unauthenticated users", async ({ page }) => {
  const response = await page.goto("/app/athlete");

  expect(response).not.toBeNull();
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app");
  await expect(page.locator("body")).not.toContainText("500");
});

// ── Authenticated flow tests ─────────────────────────────────────────────────
// These tests require seeded test data and Clerk test credentials.
// They are skipped until the test environment is set up.

test.skip("athlete with PaymentFailed status sees warning banner", async ({ page }) => {
  // TODO: Sign in with Clerk test credentials for an athlete whose
  // Stripe subscription has invoice.payment_failed webhook triggered.
  // Navigate to /app/athlete and select the coach relationship tab.
  // Assert: a red banner containing "Your last payment failed" is visible.
  // Assert: an "Update payment method" button is visible in the banner.
});

test.skip("clicking Update payment method opens the card dialog", async ({ page }) => {
  // TODO: Same setup as above.
  // Click "Update payment method" in the PaymentFailed banner.
  // Assert: a modal/dialog containing a Stripe PaymentElement iframe appears.
});

test.skip("athlete settings page always shows Change card button", async ({ page }) => {
  // TODO: Sign in with any authenticated athlete.
  // Navigate to /app/athlete and open the Settings tab.
  // Assert: a "Change card" button is present in the Payment method row.
  // Click it and assert the ChangePaymentMethodDialog opens.
});

test.skip("completing card change clears PaymentFailed banner", async ({ page }) => {
  // TODO: Full end-to-end flow:
  // 1. Athlete has PaymentFailed status.
  // 2. Athlete opens ChangePaymentMethodDialog and completes Stripe card form
  //    using Stripe's test card number 4242 4242 4242 4242.
  // 3. After redirect and sync, assert banner is no longer visible.
  // 4. Assert billing status shows "Active" or "SubscriptionActive".
});
