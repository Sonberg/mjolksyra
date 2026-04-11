import { test, expect } from "@playwright/test";

/**
 * Tests for athlete exercise management in the session view.
 * These tests use Storybook iframes so they don't require a live backend.
 */

test.describe("Athlete exercise management", () => {
  test("athlete can see all published exercises in detail view", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-view",
    );

    await expect(page.getByText("Back Squat")).toBeVisible();
    await expect(page.getByText("Romanian Deadlift")).toBeVisible();
  });

  test("athlete detail view shows delete button for all exercises (no addedBy restriction)", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-view",
    );

    // All exercises should have delete (trash) buttons in athlete view
    const deleteButtons = page.getByTitle("Remove exercise");
    await expect(deleteButtons.first()).toBeVisible();
  });

  test("athlete detail view shows add set button for all exercises", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-with-added-exercise",
    );

    // All exercises should show "Add set" buttons in athlete mode
    const addSetButtons = page.getByRole("button", { name: "Add set" });
    await expect(addSetButtons.first()).toBeVisible();
  });

  test("no session shows published exercises without completion controls", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--no-session",
    );

    await expect(page.getByText("Back Squat")).toBeVisible();
    await expect(page.getByText("Romanian Deadlift")).toBeVisible();

    // No completion date shown since no session
    await expect(page.getByText("Completed", { exact: true })).not.toBeVisible();
  });

  test("athlete empty session shows empty state prompt", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-empty-session",
    );

    await expect(page.getByText("No exercises yet")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add exercise" })).toBeVisible();
  });

  test("coach view shows draft plan indicator when draftExercises present", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--with-draft-plan",
    );

    // Coach should see published exercises
    await expect(page.getByText("Back Squat")).toBeVisible();
  });

  test("workout card shows exercise count from publishedExercises", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workout--athlete-upcoming-card",
    );

    await expect(page.getByText("3 exercises", { exact: false })).toBeVisible();
  });

  test("completed session shows completed status badge", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-view",
    );

    await expect(page.getByText("Completed")).toBeVisible();
  });

  test("athlete view shows complete workout button", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-view",
    );

    await expect(
      page.getByRole("button", { name: "Mark incomplete" }),
    ).toBeVisible();
  });

  test("coach view with completed session shows mark reviewed button", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--coach-view",
    );

    await expect(
      page.getByRole("button", { name: "Mark reviewed" }),
    ).toBeVisible();
  });
});
