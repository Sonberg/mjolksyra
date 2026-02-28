import { test, expect } from "@playwright/test";

test("unauthenticated /app/profile does not 500 and redirects", async ({ page }) => {
  const response = await page.goto("/app/profile");

  expect(response).not.toBeNull();
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app/profile");
  expect(url.includes("/sign-in") || url.endsWith("/") || url.includes("clerk")).toBeTruthy();

  await expect(page.locator("body")).not.toContainText("500");
});

// TODO: authenticated user sees their profile page with Clerk UserProfile and role status
// Requires: seeded test user and Clerk test credentials
// test("authenticated user sees profile page", async ({ page }) => {
//   // sign in via Clerk test helpers
//   await page.goto("/app/profile");
//   await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
//   await expect(page.getByText("Role status")).toBeVisible();
//   await expect(page.getByText("Coach")).toBeVisible();
//   await expect(page.getByText("Athlete")).toBeVisible();
// });
