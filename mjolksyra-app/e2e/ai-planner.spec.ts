import { expect, test } from "@playwright/test";

test.describe("AI Workout Planner", () => {
  test("idle panel shows description input and attach button", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--idle",
    );

    await expect(page.getByPlaceholder(/12-week strength block/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /attach context/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /start planner/i })).toBeVisible();
  });

  test("start button is disabled when description is empty", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--idle",
    );

    const startButton = page.getByRole("button", { name: /start/i });
    await expect(startButton).toBeDisabled();
  });

  test("pending approval state shows proposal review actions", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--pending-approval",
    );

    await expect(page.getByText("Pending approval")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Move two Friday workouts to Saturday/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /apply changes/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /discard/i })).toBeVisible();
  });

  test("pending approval session shows staged changes and clear session actions", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--pending-approval",
    );

    await expect(page.getByRole("button", { name: /attach/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /clear session/i })).toBeVisible();
    await expect(page.getByText("meet-notes.csv")).toBeVisible();
    await expect(page.getByText(/Close-Grip Bench Press/i)).toBeVisible();
  });

  test("future delete proposal shows the resolved multi-day date range", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--pending-future-delete",
    );

    await expect(page.getByText(/Delete all 49 upcoming workouts/i)).toBeVisible();
    await expect(page.getByText("Apr 8 - Jul 16")).toBeVisible();
    await expect(page.getByText(/Delete workout on 2026-04-08/i)).toBeVisible();
    await expect(page.getByText(/Delete workout on 2026-07-16/i)).toBeVisible();
  });

  test("idle panel accepts dragged attachments", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--idle",
    );

    const dataTransfer = await page.evaluateHandle(() => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File(["goal,phase\nstrength,1"], "block-notes.csv", {
          type: "text/csv",
        }),
      );
      return transfer;
    });

    const dropzone = page.getByTestId("ai-planner-attachment-dropzone");
    await dropzone.dispatchEvent("dragenter", { dataTransfer });
    await expect(page.getByText("Drop files here")).toBeVisible();
    await dropzone.dispatchEvent("drop", { dataTransfer });

    await expect(page.getByText("block-notes.csv")).toBeVisible();
  });
});
