import { expect, test } from "@playwright/test";

test.describe("Workout flow surfaces", () => {
  test("athlete list card highlights quick start action", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workout--athlete-upcoming-card",
    );

    await expect(page.getByText("Workout", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start session" })).toBeVisible();
    await expect(page.getByText("3 exercises", { exact: false })).toBeVisible();
  });

  test("coach list card surfaces needs-review state", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workout--coach-needs-review-card",
    );

    await expect(page.getByText("Review session", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Review session" })).toBeVisible();
    await expect(page.getByText("Needs review", { exact: true })).toBeVisible();
  });
});
