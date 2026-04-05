import { expect, test } from "@playwright/test";

test.describe("Athlete session management", () => {
  test("new session dialog shows a date input", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-newsessiondialog--open",
    );

    await expect(page.getByText("New session")).toBeVisible();
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create session" }),
    ).toBeVisible();
  });

  test("athlete workout detail shows Add exercise button", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-view",
    );

    await expect(
      page.getByRole("button", { name: "Add exercise" }),
    ).toBeVisible();
  });

  test("athlete empty session shows empty state and Add exercise prompt", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-empty-session",
    );

    await expect(page.getByText("No exercises yet")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add exercise" }).first(),
    ).toBeVisible();
  });

  test("coach-added exercises do not show delete or add-set controls", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-view",
    );

    // No delete or add-set controls for coach-added exercises (addedBy: null)
    await expect(page.locator('[title="Remove exercise"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add set" })).toHaveCount(0);
  });

  test("athlete-added exercise shows delete and add-set controls", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-with-own-exercise",
    );

    // Only the athlete-added exercise (second) should have controls
    await expect(page.locator('[title="Remove exercise"]')).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Add set" })).toHaveCount(1);
  });
});
