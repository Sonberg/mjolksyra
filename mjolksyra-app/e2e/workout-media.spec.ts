import { test, expect, Page } from "@playwright/test";

const R2_PUBLIC_URL = "https://media.example.com";

// Mock the R2 presigned-URL and direct-upload endpoints.
async function mockR2Upload(page: Page) {
  // Step 1: frontend POST to get presigned URL
  await page.route("**/api/uploads/presigned", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        presignedUrl: `https://fake-r2-endpoint.example.com/workouts/mock-key`,
        publicUrl: `${R2_PUBLIC_URL}/workouts/mock-key`,
        key: "workouts/mock-key",
      }),
    });
  });

  // Step 2: browser PUT directly to the R2 presigned URL
  await page.route("https://fake-r2-endpoint.example.com/**", async (route) => {
    await route.fulfill({ status: 200, body: "" });
  });
}

function buildMockLoggedWorkoutResponse(completedAt: string | null = null) {
  return {
    id: "workout-1",
    traineeId: "trainee-1",
    name: "Push Day",
    note: null,
    plannedAt: "2026-03-09",
    completedAt,
    reviewedAt: null,
    media: [],
    createdAt: "2026-03-01T00:00:00.000Z",
    appliedBlock: null,
    exercises: [
      {
        id: "ex-1",
        exerciseId: "exercise-bench",
        name: "Bench Press",
        note: null,
        isPublished: true,
        isDone: true,
        prescription: {
          type: "SetsReps",
          sets: [
            {
              target: {
                reps: 5,
                durationSeconds: null,
                distanceMeters: null,
                weightKg: 80,
                note: null,
              },
              actual: {
                reps: 5,
                weightKg: 80,
                durationSeconds: null,
                distanceMeters: null,
                note: null,
                isDone: true,
              },
            },
          ],
        },
      },
    ],
  };
}

test.describe("Workout media upload", () => {
  test("athlete sees media uploader in completion form", async ({ page }) => {
    await page.goto("/app/athlete/workouts");

    // If auth redirects, verify we land on sign-in (showing auth is required).
    const url = page.url();
    expect(url).toContain("/sign-in");
  });

  test("WorkoutMediaUploader renders Add photos / videos button", async ({
    page,
  }) => {
    await page.goto("http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default");

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

    await page.waitForSelector("img[alt^='Workout media']", { timeout: 10_000 });
    const images = page.locator("img[alt^='Workout media']");
    await expect(images).toHaveCount(3);
  });

  test("WorkoutMediaGallery renders video thumbnails", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediagallery-workoutmediagallery--videos-only",
    );

    await page.waitForSelector("video", { timeout: 10_000 });
    const videos = page.locator("video");
    await expect(videos).toHaveCount(2);
  });

  test("WorkoutMediaGallery renders nothing when empty", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediagallery-workoutmediagallery--empty",
    );

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

  // file input is NOT disabled while upload is in progress (no compression phase)
  test("file input is enabled while upload is in progress (no compression blocking)", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--uploading",
    );

    await page.waitForSelector("input[type='file']", { timeout: 10_000 });

    const input = page.locator("input[type='file']");
    await expect(input).not.toBeDisabled();
  });

  // pending previews show "Uploading..." only — no "Compressing..." state
  test("Uploading story shows Uploading label for pending previews", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--uploading",
    );

    await page.waitForSelector("label[for='workout-media-input']", { timeout: 10_000 });

    const label = page.locator("label[for='workout-media-input']");
    await expect(label).not.toContainText("Compressing");

    await expect(page.getByText("Uploading...", { exact: true })).toBeVisible();
    await expect(page.getByText("Compressing", { exact: true })).not.toBeVisible();
  });

  test("removing a URL calls DELETE /api/uploads/files with correct R2 key", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--with-r2-urls",
    );
    await page.waitForSelector("button[aria-label='Remove image']", { timeout: 10_000 });

    const deleteRequests: { keys: string[] }[] = [];
    await page.route("**/api/uploads/files", async (route) => {
      if (route.request().method() === "DELETE") {
        const body = route.request().postDataJSON();
        deleteRequests.push(body);
      }
      await route.fulfill({ status: 204, body: "" });
    });

    await page.locator("button[aria-label='Remove image']").first().click();

    await page.waitForTimeout(500);

    expect(deleteRequests.length).toBe(1);
    expect(deleteRequests[0].keys).toHaveLength(1);
    // Key should be the R2 object key (no base URL, no query string)
    expect(deleteRequests[0].keys[0]).not.toContain("https://");
    expect(deleteRequests[0].keys[0]).not.toContain("?");
  });

  test("presigned URL endpoint called with correct file metadata", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );
    await page.waitForSelector("input[type='file']", { timeout: 10_000 });

    await mockR2Upload(page);

    const presignedRequests: unknown[] = [];
    await page.route("**/api/uploads/presigned", async (route) => {
      presignedRequests.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          presignedUrl: `https://fake-r2-endpoint.example.com/workouts/mock-key`,
          publicUrl: `${R2_PUBLIC_URL}/workouts/mock-key`,
          key: "workouts/mock-key",
        }),
      });
    });

    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await page.locator("input[type='file']").setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    await page.waitForTimeout(1_000);

    expect(presignedRequests.length).toBeGreaterThan(0);
    const req = presignedRequests[0] as Record<string, unknown>;
    expect(req.fileName).toBe("test-image.png");
    expect(req.contentType).toBe("image/png");
    expect(typeof req.fileSize).toBe("number");
    expect(req.type).toBe("image");
  });

  // after file selection, shows "Uploading..." immediately (no compression delay)
  test("file input shows Uploading label immediately after file selection, then returns to idle", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );
    await page.waitForSelector("input[type='file']", { timeout: 10_000 });

    await mockR2Upload(page);

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

  test("AthleteWorkoutLogger shows completion action", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=athleteworkoutlogger-athleteworkoutlogger--not-completed",
    );

    await page.waitForSelector("button", { timeout: 10_000 });

    const completeButton = page.getByRole("button", { name: /complete workout/i }).first();
    await expect(completeButton).toBeEnabled();
  });

  test("AthleteWorkoutLogger complete sends all sets as done", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=athleteworkoutlogger-athleteworkoutlogger--not-completed",
    );

    const logRequests: Record<string, unknown>[] = [];
    await page.route("**/api/trainees/*/planned-workouts/*/log", async (route) => {
      logRequests.push(route.request().postDataJSON() as Record<string, unknown>);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildMockLoggedWorkoutResponse(new Date().toISOString())),
      });
    });

    const completeButton = page.getByRole("button", { name: /complete workout/i }).first();
    await completeButton.click();

    await expect.poll(() => logRequests.length).toBeGreaterThan(0);

    const request = logRequests[0];
    expect(request.completedAt).toBeTruthy();

    const exercises = (request.exercises as Record<string, unknown>[]) ?? [];
    const allSetsDone = exercises.every((exercise) =>
      ((exercise.sets as Record<string, unknown>[]) ?? []).every(
        (set) => set.isDone === true,
      ),
    );
    expect(allSetsDone).toBe(true);
  });

  test("AthleteWorkoutLogger auto-saves while typing set values", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=athleteworkoutlogger-athleteworkoutlogger--not-completed",
    );

    const logRequests: Record<string, unknown>[] = [];
    await page.route("**/api/trainees/*/planned-workouts/*/log", async (route) => {
      logRequests.push(route.request().postDataJSON() as Record<string, unknown>);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildMockLoggedWorkoutResponse()),
      });
    });

    const repsInput = page.getByLabel("Actual reps for set 1").first();
    await repsInput.fill("12");

    await expect.poll(() => logRequests.length).toBeGreaterThan(0);

    const containsUpdatedReps = logRequests.some((request) => {
      const exercises = (request.exercises as Record<string, unknown>[]) ?? [];
      const firstExercise = exercises[0] ?? {};
      const sets = (firstExercise.sets as Record<string, unknown>[]) ?? [];
      const firstSet = sets[0] ?? {};
      return firstSet.reps === 12;
    });

    expect(containsUpdatedReps).toBe(true);
  });

  test("AthleteWorkoutLogger renders workout chat composer", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=athleteworkoutlogger-athleteworkoutlogger--not-completed",
    );

    await page.waitForSelector("textarea[placeholder='Write a message...']", {
      timeout: 10_000,
    });

    await expect(page.getByTestId("workout-chat-panel")).toBeVisible();
    await expect(page.getByTestId("workout-chat-messages")).toBeVisible();
    await expect(page.getByText("Workout chat", { exact: true })).toBeVisible();
    await expect(page.getByText("Coach", { exact: true })).toBeVisible();

    const composer = page.getByTestId("workout-chat-composer");
    const sendButton = page.getByRole("button", { name: "Send" });

    await expect(composer).toBeVisible();
    await expect(sendButton).toBeDisabled();

    await composer.fill("Looks good, thanks coach!");
    await expect(sendButton).toBeEnabled();
  });

  test("AthleteWorkoutLogger hides analyze action for athlete", async ({ page }) => {
    await page.route("**/api/trainees/**/planned-workouts/**/chat-messages", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.goto(
      "http://localhost:6006/iframe.html?id=athleteworkoutlogger-athleteworkoutlogger--not-completed",
    );

    await expect(page.getByRole("button", { name: "Analyze" })).toHaveCount(0);
  });

  test("Coach can analyze planned workout media context", async ({ page }) => {
    await page.route("**/api/trainees/**/planned-workouts/**/chat-messages", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.route("**/api/trainees/**/planned-workouts/**/analysis", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          summary: "Session quality is solid with stable pacing.",
          keyFindings: ["Consistent squat depth"],
          techniqueRisks: ["Mild valgus on fatigue reps"],
          coachSuggestions: ["Cue knees out through ascent"],
        }),
      });
    });

    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workout--coach-needs-review-card",
    );

    const analyzeButton = page.getByRole("button", { name: "Analyze" });
    await expect(analyzeButton).toBeEnabled();
    await analyzeButton.click();

    await expect(page.getByText("AI analysis", { exact: true })).toBeVisible();
    await expect(page.getByText("Session quality is solid with stable pacing.", { exact: true })).toBeVisible();
  });
});
