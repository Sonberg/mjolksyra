import { expect, test } from "@playwright/test";

test.describe("Workout detail header", () => {
  test("mobile header keeps primary actions and chat button inside the viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetailheader--narrow-athlete-view",
    );

    await page.waitForSelector("text=Complete workout", { timeout: 10_000 });

    const completeButton = page.getByRole("button", { name: "Complete workout" });
    const chatButton = page.getByRole("button", { name: "Chat" });

    await expect(completeButton).toBeVisible();
    await expect(chatButton).toBeVisible();

    const completeBox = await completeButton.boundingBox();
    const chatBox = await chatButton.boundingBox();

    expect(completeBox).not.toBeNull();
    expect(chatBox).not.toBeNull();

    expect((completeBox?.x ?? 0) + (completeBox?.width ?? 0)).toBeLessThanOrEqual(390);
    expect((chatBox?.x ?? 0) + (chatBox?.width ?? 0)).toBeLessThanOrEqual(390);
  });
});
