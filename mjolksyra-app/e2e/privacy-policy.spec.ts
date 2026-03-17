import { test, expect } from "@playwright/test";

test("privacy policy page loads without authentication", async ({ page }) => {
  const response = await page.goto("/privacy-policy");
  expect(response?.ok()).toBeTruthy();
});

test("privacy policy page is not behind an auth redirect", async ({ page }) => {
  await page.goto("/privacy-policy");
  expect(page.url()).toMatch(/\/privacy-policy/);
});

test("privacy policy main heading is visible", async ({ page }) => {
  await page.goto("/privacy-policy");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy" }),
  ).toBeVisible();
});

test("privacy policy key sections are present", async ({ page }) => {
  await page.goto("/privacy-policy");

  await expect(
    page.getByRole("heading", { name: "Information We Collect" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How We Use Your Information" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Third-Party Services" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your Rights" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Cookies" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Contact" }),
  ).toBeVisible();
});
