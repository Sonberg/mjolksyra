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

  test("ready-to-generate state shows confirm card with preview and edit buttons", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--ready-to-generate",
    );

    await expect(page.getByText("Ready to generate")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("12 weeks")).toBeVisible();
    await expect(page.getByRole("button", { name: /preview plan/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
  });

  test("started session shows attach and clear session actions", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=aiplanpanel--started-session",
    );

    await expect(page.getByRole("button", { name: /attach/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /clear session/i })).toBeVisible();
    await expect(page.getByText("meet-notes.csv")).toBeVisible();
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
    await expect(page.getByText("Drop files to attach")).toBeVisible();
    await dropzone.dispatchEvent("drop", { dataTransfer });

    await expect(page.getByText("block-notes.csv")).toBeVisible();
  });
});
