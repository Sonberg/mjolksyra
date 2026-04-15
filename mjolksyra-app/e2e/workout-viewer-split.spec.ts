import { expect, test } from "@playwright/test";

test.describe("Workout viewer split", () => {
  test("planned workout card shows in-progress state for started workouts", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutcard--athlete-started",
    );

    await expect(page.getByText("In progress", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open session" })).toBeVisible();
  });

  test("planned workout detail shows planning-only UI", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-plannedworkoutdetail--athlete-view",
    );

    await expect(page.getByText("Planned workout")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start session" })).toBeVisible();
    await expect(page.getByText("Coach note")).toBeVisible();
  });

  test("completed workout card supports ad hoc workouts", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-completedworkoutcard--ad-hoc",
    );

    await expect(page.getByText("Completed", { exact: true })).toBeVisible();
    await expect(page.getByText("1 exercises")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open" })).toBeVisible();
  });
});
