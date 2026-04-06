import { expect, test } from "@playwright/test";

test.describe("WorkoutPlanPreview", () => {
  test("default story shows week groups and exercises", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel-workoutplanpreview--default",
    );

    await expect(page.getByText("Plan Preview")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/week 1/i)).toBeVisible();
    await expect(page.getByText(/week 2/i)).toBeVisible();
    await expect(page.getByText("Squat")).toBeVisible();
    await expect(page.getByText("Bench Press")).toBeVisible();
  });

  test("default story shows generate and refine buttons", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel-workoutplanpreview--default",
    );

    await expect(page.getByRole("button", { name: /generate/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /refine/i })).toBeVisible();
  });

  test("refine button is disabled when feedback is empty", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel-workoutplanpreview--default",
    );

    const refineButton = page.getByRole("button", { name: /refine/i });
    await expect(refineButton).toBeDisabled({ timeout: 10000 });
  });

  test("refine button enables when feedback is typed", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel-workoutplanpreview--default",
    );

    await page.getByPlaceholder(/give feedback/i).fill("Add more accessory work on squat day");
    await expect(page.getByRole("button", { name: /refine/i })).toBeEnabled();
  });

  test("empty plan story shows no-workouts message and disables generate", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel-workoutplanpreview--empty-plan",
    );

    await expect(page.getByText(/no workouts/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /generate/i })).toBeDisabled();
  });

  test("loading story disables generate and refine buttons", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel-workoutplanpreview--loading",
    );

    await expect(page.getByRole("button", { name: /generate/i })).toBeDisabled({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /refine/i })).toBeDisabled();
  });

  test("shows workout count summary in header", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel-workoutplanpreview--default",
    );

    await expect(page.getByText(/5 workouts/i)).toBeVisible({ timeout: 10000 });
  });

  test("prescription formatting shows sets and weight", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel-workoutplanpreview--single-week",
    );

    await expect(page.getByText(/4×5 @ 100kg/i)).toBeVisible({ timeout: 10000 });
  });
});
