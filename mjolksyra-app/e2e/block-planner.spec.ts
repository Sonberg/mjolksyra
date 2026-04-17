import { expect, test } from "@playwright/test";

test.describe("Block Planner Panel", () => {
  test("idle panel shows description textarea and attach button", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=blockplannerpanel--idle",
    );

    await expect(page.getByPlaceholder(/12-week strength block/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /attach context/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
  });

  test("send button is disabled when description is empty", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=blockplannerpanel--idle",
    );

    const sendButton = page.getByRole("button", { name: /send/i });
    await expect(sendButton).toBeDisabled();
  });

  test("follow-up state shows chat messages and reply composer", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=blockplannerpanel--asking-follow-up",
    );

    await expect(page.getByText(/12-week strength block/i)).toBeVisible();
    await expect(page.getByText(/Maximal strength/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Maximal strength/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hypertrophy/i })).toBeVisible();
  });

  test("pending approval state shows proposal review card", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=blockplannerpanel--pending-approval",
    );

    await expect(page.getByText("Pending approval")).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/Add a lower-body strength workout in Week 1/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /apply changes \(1 cr\)/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /discard/i })).toBeVisible();
    await expect(page.getByText(/Rounded and capped at 5 cr/i)).toBeVisible();
  });

  test("pending approval shows Week/Day position label instead of dates", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=blockplannerpanel--pending-approval",
    );

    await expect(page.getByText(/Week 1 \/ Mon/i)).toBeVisible();
  });

  test("pending approval shows exercise count in action row", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=blockplannerpanel--pending-approval",
    );

    await expect(page.getByText(/1 exercise/i)).toBeVisible();
  });

  test("large proposal shows 5 cr cap and multiple staged changes", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=blockplannerpanel--pending-large-proposal",
    );

    await expect(
      page.getByText(/Generate 4-week upper\/lower block/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /apply changes \(5 cr\)/i }),
    ).toBeVisible();
    await expect(page.getByText(/6 staged changes/i)).toBeVisible();
  });

  test("clear session button appears once a session is started", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=blockplannerpanel--asking-follow-up",
    );

    await expect(
      page.getByRole("button", { name: /clear session/i }),
    ).toBeVisible();
  });
});
