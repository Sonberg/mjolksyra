"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { useCallback, useRef, useState } from "react";
import { ImageIcon, VideoIcon, XIcon, UploadIcon, Loader2Icon } from "lucide-react";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
  mediaUrls: string[];
  onUploadComplete: (urls: string[]) => void;
  isPending?: boolean;
};

type PendingPreview = {
  localUrl: string; // blob: URL for instant preview
  isVideo: boolean;
  name: string;
};

// UploadThing CDN URLs have no file extension (e.g. https://utfs.io/f/abc123).
// We tag video URLs with ?ct=video at upload time so detection is reliable.
// Fall back to extension matching for story fixtures and any pre-tagged URLs.
export function isVideoUrl(url: string) {
  try {
    const ct = new URL(url).searchParams.get("ct");
    if (ct !== null) return ct === "video";
  } catch {}
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url);
}

function getFilename(url: string) {
  try {
    const path = new URL(url).pathname;
    return path.split("/").pop() ?? url;
  } catch {
    return url;
  }
}

export function WorkoutMediaUploader({
  traineeId,
  plannedWorkoutId,
  mediaUrls,
  onUploadComplete,
  isPending,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>([]);

  const { startUpload, isUploading } = useUploadThing("workoutImage", {
    onClientUploadComplete: (res) => {
      const newUrls = res.map((f) => f.ufsUrl);
      onUploadComplete([...mediaUrls, ...newUrls]);
      // Revoke blob URLs for uploaded images and remove from pending
      setPendingPreviews((prev) => {
        prev.filter((p) => !p.isVideo).forEach((p) => URL.revokeObjectURL(p.localUrl));
        return prev.filter((p) => p.isVideo);
      });
    },
    onUploadError: () => {
      setPendingPreviews((prev) => {
        prev.filter((p) => !p.isVideo).forEach((p) => URL.revokeObjectURL(p.localUrl));
        return prev.filter((p) => p.isVideo);
      });
    },
  });

  const { startUpload: startVideoUpload, isUploading: isVideoUploading } = useUploadThing(
    "workoutVideo",
    {
      onClientUploadComplete: (res) => {
        // Tag video URLs so isVideoUrl() can identify them without a file extension.
        const newUrls = res.map((f) => `${f.ufsUrl}?ct=video`);
        onUploadComplete([...mediaUrls, ...newUrls]);
        setPendingPreviews((prev) => {
          prev.filter((p) => p.isVideo).forEach((p) => URL.revokeObjectURL(p.localUrl));
          return prev.filter((p) => !p.isVideo);
        });
      },
      onUploadError: () => {
        setPendingPreviews((prev) => {
          prev.filter((p) => p.isVideo).forEach((p) => URL.revokeObjectURL(p.localUrl));
          return prev.filter((p) => !p.isVideo);
        });
      },
    },
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      // Show local previews immediately — before any network request
      const previews: PendingPreview[] = files.map((f) => ({
        localUrl: URL.createObjectURL(f),
        isVideo: f.type.startsWith("video/"),
        name: f.name,
      }));
      setPendingPreviews((prev) => [...prev, ...previews]);

      const images = files.filter((f) => f.type.startsWith("image/"));
      const videos = files.filter((f) => f.type.startsWith("video/"));

      const input = { traineeId, plannedWorkoutId };
      if (images.length) await startUpload(images, input);
      if (videos.length) await startVideoUpload(videos, input);

      if (inputRef.current) inputRef.current.value = "";
    },
    [startUpload, startVideoUpload, traineeId, plannedWorkoutId, mediaUrls],
  );

  const removeUrl = (urlToRemove: string) => {
    onUploadComplete(mediaUrls.filter((u) => u !== urlToRemove));
  };

  const uploading = isUploading || isVideoUploading;
  const disabled = isPending || uploading;
  const hasItems = mediaUrls.length > 0 || pendingPreviews.length > 0;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
        Media (optional)
      </p>

      {hasItems ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {/* Confirmed uploads */}
          {mediaUrls.map((url) =>
            isVideoUrl(url) ? (
              <div
                key={url}
                className="relative flex items-center gap-2 border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2"
              >
                <VideoIcon className="h-4 w-4 shrink-0 text-[var(--shell-muted)]" />
                <span className="max-w-[140px] truncate text-xs text-[var(--shell-ink)]">
                  {getFilename(url)}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeUrl(url)}
                  className="ml-1 text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] disabled:opacity-40"
                  aria-label="Remove video"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Workout media"
                  className="h-20 w-20 border-2 border-[var(--shell-border)] object-cover"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeUrl(url)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-[var(--shell-ink)] text-[var(--shell-surface)] transition hover:bg-[var(--shell-ink-soft)] disabled:opacity-40"
                  aria-label="Remove image"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            ),
          )}

          {/* Pending previews — shown immediately on file selection, before upload finishes */}
          {pendingPreviews.map((preview) =>
            preview.isVideo ? (
              <div
                key={preview.localUrl}
                className="relative flex items-center gap-2 border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2"
              >
                <Loader2Icon className="h-4 w-4 shrink-0 animate-spin text-[var(--shell-muted)]" />
                <span className="max-w-[140px] truncate text-xs text-[var(--shell-muted)]">
                  {preview.name}
                </span>
              </div>
            ) : (
              <div key={preview.localUrl} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.localUrl}
                  alt="Uploading..."
                  className="h-20 w-20 border-2 border-[var(--shell-border)] object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2Icon className="h-5 w-5 animate-spin text-[var(--shell-ink)]" />
                </div>
              </div>
            ),
          )}
        </div>
      ) : null}

      <div className="mt-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
          multiple
          disabled={disabled}
          onChange={handleFileChange}
          className="sr-only"
          id="workout-media-input"
        />
        <label
          htmlFor="workout-media-input"
          className={[
            "inline-flex cursor-pointer items-center gap-2 border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)]",
            disabled ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        >
          {uploading ? (
            <>
              <UploadIcon className="h-3.5 w-3.5 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <ImageIcon className="h-3.5 w-3.5" />
              Add photos / videos
            </>
          )}
        </label>
      </div>
    </div>
  );
}
