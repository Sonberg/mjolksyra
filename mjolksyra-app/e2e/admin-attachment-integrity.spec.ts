import { expect, test } from "@playwright/test";

test.describe("Admin attachment integrity", () => {
  test("story renders integrity sections", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=admin-attachmentintegritytab--default",
    );

    await expect(page.getByText("Attachment integrity")).toBeVisible();
    await expect(page.getByText("Orphan objects")).toBeVisible();
    await expect(page.getByText("Raw with compressed")).toBeVisible();
    await expect(page.getByText("Dead references")).toBeVisible();
    await expect(page.getByText("workouts/trainee-a/orphan-1.webp")).toBeVisible();
    await expect(page.getByText("R2 object is missing.")).toBeVisible();
  });
});
