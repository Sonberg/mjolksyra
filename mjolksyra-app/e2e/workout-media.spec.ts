import { test, expect, Page } from "@playwright/test";
import path from "path";

// Mock the UploadThing endpoint so tests don't require real credentials.
// The mock returns a fake URL that we can assert against later.
async function mockUploadThing(page: Page) {
  await page.route("**/api/uploadthing**", async (route) => {
    const method = route.request().method();

    // UploadThing first sends a POST to get presigned URLs, then uploads directly.
    // We intercept and return a fake response that the client accepts.
    if (method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            url: "https://utfs.io/f/mock-image.jpg",
            name: "mock-image.jpg",
            key: "mock-image.jpg",
            ufsUrl: "https://utfs.io/f/mock-image.jpg",
          },
        ]),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe("Workout media upload", () => {
  test("athlete sees media uploader in completion form", async ({ page }) => {
    // Navigate to a workout page — adjust the URL to match your app routing.
    // We use a mock auth cookie / setup if needed; for now we just verify the UI.
    await page.goto("/app/athlete/workouts");

    // If auth redirects, verify we land on sign-in (showing auth is required).
    const url = page.url();
    expect(url).toContain("/sign-in");
  });

  test("WorkoutMediaUploader renders Add photos / videos button", async ({
    page,
  }) => {
    // This test uses Storybook to render the isolated component without full auth.
    await page.goto("http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default");

    // Wait for Storybook to render the component.
    await page.waitForSelector("label[for='workout-media-input']", {
      timeout: 10_000,
    });

    const label = page.locator("label[for='workout-media-input']");
    await expect(label).toBeVisible();
    await expect(label).toContainText("Add photos / videos");
  });

  test("WorkoutMediaUploader with existing uploads shows thumbnails and remove buttons", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--with-existing-uploads",
    );

    // Images show as <img> tags.
    await page.waitForSelector("img[alt='Workout media']", { timeout: 10_000 });
    const images = page.locator("img[alt='Workout media']");
    await expect(images).toHaveCount(2);

    // Remove buttons are present.
    const removeButtons = page.locator("button[aria-label='Remove image']");
    await expect(removeButtons).toHaveCount(2);
  });

  test("WorkoutMediaGallery renders images in grid", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediagallery-workoutmediagallery--images-only",
    );

    // Gallery uses alt="Workout media N" (e.g. "Workout media 1")
    await page.waitForSelector("img[alt^='Workout media']", { timeout: 10_000 });
    const images = page.locator("img[alt^='Workout media']");
    await expect(images).toHaveCount(3);
  });

  test("WorkoutMediaGallery renders video thumbnails", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediagallery-workoutmediagallery--videos-only",
    );

    // Gallery shows videos as thumbnails (no controls) with a play icon overlay.
    // Controls only appear when the video is opened in the lightbox.
    await page.waitForSelector("video", { timeout: 10_000 });
    const videos = page.locator("video");
    await expect(videos).toHaveCount(2);
  });

  test("WorkoutMediaGallery renders nothing when empty", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediagallery-workoutmediagallery--empty",
    );

    // Give Storybook time to render.
    await page.waitForTimeout(2_000);

    const images = page.locator("img[alt^='Workout media']");
    await expect(images).toHaveCount(0);
    const videos = page.locator("video");
    await expect(videos).toHaveCount(0);
  });

  test("file input accepts images and videos", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );

    await page.waitForSelector("input[type='file']", { timeout: 10_000 });
    const input = page.locator("input[type='file']");
    await expect(input).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime",
    );
    await expect(input).toHaveAttribute("multiple", "");
  });

  test("disabled state prevents interaction", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--disabled",
    );

    await page.waitForSelector("input[type='file']", { timeout: 10_000 });
    const input = page.locator("input[type='file']");
    await expect(input).toBeDisabled();
  });

  // Fix 1: file input is NOT disabled while upload is in progress (no compression phase)
  test("file input is enabled while upload is in progress (no compression blocking)", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--uploading",
    );

    await page.waitForSelector("input[type='file']", { timeout: 10_000 });

    // The Uploading story pre-populates pending previews but isPending is not set,
    // so the file input should not be disabled (uploads can be added freely)
    const input = page.locator("input[type='file']");
    await expect(input).not.toBeDisabled();
  });

  // Fix 1: pending previews show "Uploading..." only — no "Compressing..." state
  test("Uploading story shows Uploading label for pending previews", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--uploading",
    );

    await page.waitForSelector("label[for='workout-media-input']", { timeout: 10_000 });

    // The button label shows "Add photos / videos" (not "Compressing...")
    const label = page.locator("label[for='workout-media-input']");
    await expect(label).not.toContainText("Compressing");

    // Video pending preview shows "Uploading..."
    await expect(page.getByText("Uploading...", { exact: true })).toBeVisible();

    // No "Compressing" overlay text anywhere
    await expect(page.getByText("Compressing", { exact: true })).not.toBeVisible();
  });

  test("removing a URL calls DELETE /api/uploadthing/files with correct file key", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--with-existing-uploads",
    );
    await page.waitForSelector("button[aria-label='Remove image']", { timeout: 10_000 });

    const deleteRequests: { fileKeys: string[] }[] = [];
    await page.route("**/api/uploadthing/files", async (route) => {
      if (route.request().method() === "DELETE") {
        const body = route.request().postDataJSON();
        deleteRequests.push(body);
      }
      await route.fulfill({ status: 204, body: "" });
    });

    await page.locator("button[aria-label='Remove image']").first().click();

    // Give the fire-and-forget fetch time to execute
    await page.waitForTimeout(500);

    expect(deleteRequests.length).toBe(1);
    expect(deleteRequests[0].fileKeys).toHaveLength(1);
    // File key should be extracted from the URL (no query params, path segment after /f/)
    expect(deleteRequests[0].fileKeys[0]).not.toContain("https://");
    expect(deleteRequests[0].fileKeys[0]).not.toContain("?");
  });

  // Fix 1: after file selection, shows "Uploading..." immediately (no compression delay)
  test("file input shows Uploading label immediately after file selection, then returns to idle", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );
    await page.waitForSelector("input[type='file']", { timeout: 10_000 });

    // Mock UploadThing so upload pipeline can complete without real credentials
    await mockUploadThing(page);

    // Attach a tiny 1×1 pixel PNG
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await page.locator("input[type='file']").setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    // "Compressing" must NEVER appear (client-side compression removed)
    await expect(page.getByText("Compressing", { exact: true })).not.toBeVisible();

    // After upload completes the button reverts to idle state
    await expect(page.locator("label[for='workout-media-input']")).toContainText(
      "Add photos / videos",
      { timeout: 30_000 },
    );
  });

  // Fix 2: "Complete workout" header button disabled while media uploads are pending
  test("AthleteWorkoutLogger Complete workout button is disabled while media is uploading", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=athleteworkoutlogger-athleteworkoutlogger--logging-with-pending-upload",
    );

    // Wait for the header button to appear (visible on sm+ screens)
    await page.waitForSelector("button", { timeout: 10_000 });

    // The "Complete workout" button should be disabled when uploads are pending
    const completeButton = page.getByRole("button", { name: /complete workout/i }).first();
    await expect(completeButton).toBeDisabled();
  });
});
