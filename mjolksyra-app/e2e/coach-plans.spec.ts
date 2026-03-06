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

// TODO: authenticated coach with Starter plan sees 3 plan cards with Starter highlighted
// Requires: seeded test coach in MongoDB with Clerk test credentials
// test("coach sees plan selector with 3 plans on dashboard", async ({ page }) => {
//   // sign in as test coach
//   // navigate to /app/coach/dashboard
//   // expect 3 plan cards: Starter, Pro, Scale
//   // Starter should be highlighted as current plan
// });

// TODO: coach with many athletes sees upgrade nudge toward cheaper plan
// test("coach with 8 athletes sees nudge to upgrade from Starter", async ({ page }) => {
//   // sign in as test coach with 8 active athletes on Starter plan
//   // expect nudge banner suggesting Pro or Scale
// });
