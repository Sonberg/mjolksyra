import { test, expect } from "@playwright/test";

test("unauthenticated /app/coach/payments redirects away from AI credits page", async ({ page }) => {
  const response = await page.goto("/app/coach/payments");

  expect(response).not.toBeNull();
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app/coach/payments");
  expect(url.includes("/sign-in") || url.endsWith("/") || url.includes("clerk")).toBeTruthy();

  await expect(page.locator("body")).not.toContainText("500");
});

test("GET /api/ai-credit-packs returns JSON array", async ({ request }) => {
  const response = await request.get("/api/ai-credit-packs");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
});

// TODO: authenticated coach — plan selector shows AI credits per plan
// Requires: seeded test coach in MongoDB with Clerk test credentials
// test("plan selector shows AI credits per plan", async ({ page }) => {
//   // sign in as test coach
//   // navigate to /app/coach/payments
//   // expect each plan card to contain "AI credits/mo"
//   const cards = page.locator("[data-testid='plan-card']");
//   await expect(cards.first().getByText(/AI credits\/mo/i)).toBeVisible();
// });

// TODO: authenticated coach — dashboard shows AI credit balance
// Requires: seeded test coach with UserCredits document in MongoDB
// test("dashboard shows AI credit balance with included, purchased, and total", async ({ page }) => {
//   // sign in as test coach
//   // navigate to /app/coach/payments
//   // expect the AI credits section to show Included / Purchased / Total columns
//   await expect(page.getByText(/Included/i)).toBeVisible();
//   await expect(page.getByText(/Purchased/i)).toBeVisible();
//   await expect(page.getByText(/Total/i)).toBeVisible();
// });

// TODO: authenticated coach — buying a pack triggers Stripe invoice and updates displayed balance
// Requires: seeded test coach with Stripe customer ID, Stripe test mode, and webhook forwarding
// test("buying a credit pack updates displayed balance", async ({ page }) => {
//   // sign in as test coach
//   // navigate to /app/coach/payments
//   // click "Buy" on the Small pack
//   // expect success message "Purchase initiated. Credits will be added shortly."
//   await page.getByRole("button", { name: /buy/i }).first().click();
//   await expect(page.getByText(/purchase initiated/i)).toBeVisible();
// });

// TODO: authenticated coach with 0 credits — AI action shows insufficient credits error
// Requires: seeded test coach with UserCredits { includedRemaining: 0, purchasedRemaining: 0 }
// test("0-credit state returns 422 on consume attempt", async ({ request, page }) => {
//   // sign in as test coach with 0 credits
//   // POST /api/coaches/ai-credits/consume with a valid action
//   // expect 422 response with an error message
//   const response = await request.post("/api/coaches/ai-credits/consume", {
//     data: { action: "PlanWorkout" },
//   });
//   expect(response.status()).toBe(422);
// });
