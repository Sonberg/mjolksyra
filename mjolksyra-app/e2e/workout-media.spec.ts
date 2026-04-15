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

async function createFileDropDataTransfer(
  page: Page,
  {
    name,
    mimeType,
    buffer,
  }: { name: string; mimeType: string; buffer: Buffer },
) {
  return page.evaluateHandle(
    async ({ name, mimeType, bytes }) => {
      const dataTransfer = new DataTransfer();
      const file = new File([new Uint8Array(bytes)], name, { type: mimeType });
      dataTransfer.items.add(file);
      return dataTransfer;
    },
    { name, mimeType, bytes: Array.from(buffer) },
  );
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

    await page.waitForSelector("[data-testid='workout-media-input-label']", {
      timeout: 10_000,
    });

    const label = page.getByTestId("workout-media-input-label");
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

  test("file input accepts wildcard images and videos", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );

    await page.waitForSelector("[data-testid='workout-media-input']", { timeout: 10_000 });
    const input = page.getByTestId("workout-media-input");
    await expect(input).toHaveAttribute(
      "accept",
      "image/*,video/*,.jpg,.jpeg,.png,.gif,.webp,.avif,.heic,.heif,.mp4,.mov,.m4v,.webm",
    );
    await expect(input).toHaveAttribute("multiple", "");
  });

  test("disabled state prevents interaction", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--disabled",
    );

    await page.waitForSelector("[data-testid='workout-media-input']", { timeout: 10_000 });
    const input = page.getByTestId("workout-media-input");
    await expect(input).toBeDisabled();
  });

  // file input is NOT disabled while upload is in progress (no compression phase)
  test("file input is enabled while upload is in progress (no compression blocking)", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--uploading",
    );

    await page.waitForSelector("[data-testid='workout-media-input']", { timeout: 10_000 });

    const input = page.getByTestId("workout-media-input");
    await expect(input).not.toBeDisabled();
  });

  // pending previews show "Uploading..." only — no "Compressing..." state
  test("Uploading story shows Uploading label for pending previews", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--uploading",
    );

    await page.waitForSelector("[data-testid='workout-media-input-label']", { timeout: 10_000 });

    const label = page.getByTestId("workout-media-input-label");
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
    await page.waitForSelector("[data-testid='workout-media-input']", { timeout: 10_000 });

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
    await page.getByTestId("workout-media-input").setInputFiles({
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

  test("iphone-style files with empty mime type still request a valid upload content type", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );
    await page.waitForSelector("[data-testid='workout-media-input']", { timeout: 10_000 });

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

    await page.route("https://fake-r2-endpoint.example.com/**", async (route) => {
      await route.fulfill({ status: 200, body: "" });
    });

    const heicLikeBuffer = Buffer.from("iphone-photo");
    await page.getByTestId("workout-media-input").setInputFiles({
      name: "IMG_0001.HEIC",
      mimeType: "",
      buffer: heicLikeBuffer,
    });

    await page.waitForTimeout(1_000);

    expect(presignedRequests.length).toBeGreaterThan(0);
    const req = presignedRequests[0] as Record<string, unknown>;
    expect(req.fileName).toBe("IMG_0001.HEIC");
    expect(req.contentType).toBe("image/heic");
    expect(req.type).toBe("image");
  });

  test("iphone-style files with generic mime type fall back to extension", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );
    await page.waitForSelector("[data-testid='workout-media-input']", { timeout: 10_000 });

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

    await page.route("https://fake-r2-endpoint.example.com/**", async (route) => {
      await route.fulfill({ status: 200, body: "" });
    });

    const movLikeBuffer = Buffer.from("iphone-video");
    await page.getByTestId("workout-media-input").setInputFiles({
      name: "IMG_4321.MOV",
      mimeType: "application/octet-stream",
      buffer: movLikeBuffer,
    });

    await page.waitForTimeout(1_000);

    expect(presignedRequests.length).toBeGreaterThan(0);
    const req = presignedRequests[0] as Record<string, unknown>;
    expect(req.fileName).toBe("IMG_4321.MOV");
    expect(req.contentType).toBe("video/quicktime");
    expect(req.type).toBe("video");
  });

  // after file selection, shows "Uploading..." immediately (no compression delay)
  test("file input shows Uploading label immediately after file selection, then returns to idle", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );
    await page.waitForSelector("[data-testid='workout-media-input']", { timeout: 10_000 });

    await mockR2Upload(page);

    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await page.getByTestId("workout-media-input").setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    // "Compressing" must NEVER appear (client-side compression removed)
    await expect(page.getByText("Compressing", { exact: true })).not.toBeVisible();

    // After upload completes the button reverts to idle state
    await expect(page.getByTestId("workout-media-input-label")).toContainText(
      "Add photos / videos",
      { timeout: 30_000 },
    );
  });

  test("dragging files onto the default uploader uploads media", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--default",
    );

    await mockR2Upload(page);

    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    const dataTransfer = await createFileDropDataTransfer(page, {
      name: "drop-image.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    const dropzone = page.getByTestId("workout-media-dropzone");
    await dropzone.dispatchEvent("dragenter", { dataTransfer });
    await expect(page.getByTestId("workout-media-input-label")).toContainText("Drop photos / videos");
    await dropzone.dispatchEvent("drop", { dataTransfer });

    await expect(page.locator("img[alt='Workout media']")).toHaveCount(1, { timeout: 30_000 });
  });

  test("dragging files onto the compact uploader uploads media", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutmediauploader-workoutmediauploader--compact",
    );

    await mockR2Upload(page);

    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    const dataTransfer = await createFileDropDataTransfer(page, {
      name: "compact-drop-image.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    const dropzone = page.getByTestId("workout-media-dropzone");
    await dropzone.dispatchEvent("dragenter", { dataTransfer });
    await expect(page.getByTestId("workout-media-input-label")).toContainText("Drop to upload");
    await dropzone.dispatchEvent("drop", { dataTransfer });

    await expect(page.locator("img[alt='Workout media']")).toHaveCount(1, { timeout: 30_000 });
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

  test("AthleteWorkoutLogger keeps the active field focused after autosave", async ({ page }) => {
    await page.goto(
      "http://localhost:6006/iframe.html?id=athleteworkoutlogger-athleteworkoutlogger--not-completed",
    );

    await page.route("**/api/trainees/*/planned-workouts/*/log", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildMockLoggedWorkoutResponse()),
      });
    });

    const noteInput = page.getByLabel("Note for set 1").first();
    await noteInput.click();
    await noteInput.fill("@8. feels stable");

    await page.waitForTimeout(900);

    await expect(noteInput).toBeFocused();
    await expect(noteInput).toHaveValue("@8. feels stable");
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

  test("mobile chat sheet keeps uploaded media visible before sending", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--athlete-view",
    );

    await mockR2Upload(page);

    await page.getByRole("button", { name: "Open chat" }).click();
    await expect(page.getByTestId("workout-chat-panel")).toBeVisible();

    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );

    await page.getByTestId("workout-media-input").setInputFiles({
      name: "mobile-preview.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    await expect(page.locator("img[alt='Workout media']")).toHaveCount(1, { timeout: 30_000 });
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
    await expect(page.getByTestId("workout-analysis-section")).toHaveCount(0);
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

    await page.route("**/api/trainees/**/planned-workouts/**/analysis/latest", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          summary: "Latest saved analysis from a previous run.",
          keyFindings: ["Solid setup"],
          techniqueRisks: ["Bar drifts forward at fatigue"],
          coachSuggestions: ["Keep lats engaged through ascent"],
          createdAt: "2026-04-03T08:45:00.000Z",
        }),
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
          createdAt: "2026-04-04T09:00:00.000Z",
        }),
      });
    });

    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--coach-view",
    );

    const sidebar = page.getByTestId("workout-detail-sidebar");
    await expect(sidebar.getByTestId("workout-analysis-section")).toBeVisible();
    
    const mainContent = page.getByTestId("workout-detail-main");
    await expect(mainContent.getByText("Latest saved analysis from a previous run.")).toBeVisible();

    const analyzeButton = sidebar.getByRole("button", { name: "Analyze" });
    await expect(analyzeButton).toBeEnabled();
    await analyzeButton.click();

    await expect(mainContent.getByTestId("workout-analysis-outcome")).toBeVisible();
    await expect(mainContent.getByText("AI analysis")).toBeVisible();
    await expect(mainContent.getByText("Session quality is solid with stable pacing.")).toBeVisible();
  });

  test("Coach sees credit error when analysis credits are insufficient", async ({ page }) => {
    await page.route("**/api/trainees/**/planned-workouts/**/chat-messages", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await page.route("**/api/trainees/**/planned-workouts/**/analysis/latest", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.route("**/api/trainees/**/planned-workouts/**/analysis", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Insufficient credits.",
        }),
      });
    });

    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--coach-view",
    );

    const analyzeButton = page.getByRole("button", { name: "Analyze" });
    await analyzeButton.click();

    await expect(page.getByText("Insufficient credits.", { exact: true })).toBeVisible();
  });

  test("Coach sees analysis credit cost on action", async ({ page }) => {
    await page.route("**/api/coaches/credits/pricing", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            action: "AnalyzeCompletedWorkoutMedia",
            creditCost: 5,
          },
        ]),
      });
    });

    await page.goto(
      "http://localhost:6006/iframe.html?id=workoutviewer-workoutdetail--coach-view",
    );

    await expect(page.getByRole("button", { name: "Analyze (5 credits)" })).toBeVisible();
  });
});
