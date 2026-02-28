import { test, expect } from "@playwright/test";

test("unauthenticated /app/admin does not 500 and redirects", async ({ page }) => {
  const response = await page.goto("/app/admin");

  expect(response).not.toBeNull();
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app/admin");
  expect(url.includes("/sign-in") || url.endsWith("/") || url.includes("clerk")).toBeTruthy();

  await expect(page.locator("body")).not.toContainText("500");
});

test("unauthenticated /app/admin/feedback does not 500 and redirects", async ({ page }) => {
  const response = await page.goto("/app/admin/feedback");

  expect(response).not.toBeNull();
  await page.waitForLoadState("domcontentloaded");

  const url = page.url();
  expect(url).not.toContain("/app/admin/feedback");
  expect(url.includes("/sign-in") || url.endsWith("/") || url.includes("clerk")).toBeTruthy();

  await expect(page.locator("body")).not.toContainText("500");
});

// TODO: authenticated admin user sees stat cards on /app/admin
// Requires: seeded test user with isAdmin: true in MongoDB, and Clerk test credentials
// test("admin user sees platform stats", async ({ page }) => { ... });

// TODO: authenticated non-admin user is redirected from /app/admin to /app
// Requires: seeded non-admin test user and Clerk test credentials
// test("non-admin user is redirected from /app/admin", async ({ page }) => { ... });

// TODO: admin user sees feedback list and can mark reports as resolved
// Requires: seeded admin user, Clerk test credentials, and pre-existing feedback reports
// test("admin user can mark feedback report as resolved", async ({ page }) => { ... });
