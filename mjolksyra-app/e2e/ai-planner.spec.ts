import { expect, test } from "@playwright/test";

test.describe("AI Workout Planner", () => {
  test("idle panel shows description input and attach button", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--idle",
    );

    await expect(page.getByPlaceholder(/describe the program/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /attach/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /start/i })).toBeVisible();
  });

  test("start button is disabled when description is empty", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--idle",
    );

    const startButton = page.getByRole("button", { name: /start/i });
    await expect(startButton).toBeDisabled();
  });

  test("ready-to-generate state shows confirm card with params", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--ready-to-generate",
    );

    const textarea = page.getByPlaceholder(/describe the program/i);
    await textarea.fill("12-week powerlifting program, 3 days/week");

    const startButton = page.getByRole("button", { name: /start/i });
    await startButton.click();

    await expect(page.getByText("Ready to generate")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("12 weeks")).toBeVisible();
    await expect(page.getByRole("button", { name: /generate/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
  });
});
