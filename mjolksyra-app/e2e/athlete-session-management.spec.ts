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

  test("athlete workout detail shows delete and add-set buttons per exercise", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-view",
    );

    // Delete exercise button on first exercise
    await expect(page.locator('[title="Remove exercise"]').first()).toBeVisible();

    // Add set button on first exercise
    await expect(
      page.getByRole("button", { name: "Add set" }).first(),
    ).toBeVisible();
  });
});
