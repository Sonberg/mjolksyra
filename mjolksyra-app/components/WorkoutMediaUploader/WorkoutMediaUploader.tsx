"use client";

import { useUploadThing, extractFileKey } from "@/lib/uploadthing";
import { compressImage, compressVideo } from "@/lib/media-compression";
import { useCallback, useRef, useState } from "react";
import { ImageIcon, VideoIcon, XIcon, UploadIcon, Loader2Icon } from "lucide-react";

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
  mediaUrls: string[];
  onUploadComplete: (urls: string[]) => void;
  isPending?: boolean;
  /** @internal For Storybook and testing only. Pre-populates pending previews. */
  _testPendingPreviews?: PendingPreview[];
};

export type PendingPreview = {
  id: string;
  localUrl: string; // blob: URL for instant preview
  isVideo: boolean;
  name: string;
  isCompressing: boolean;
  compressionProgress?: number; // 0–100, videos only
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
  _testPendingPreviews,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>(
    _testPendingPreviews ?? [],
  );

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

      // Show local previews immediately — before compression or network requests
      const previews: PendingPreview[] = files.map((f) => ({
        id: crypto.randomUUID(),
        localUrl: URL.createObjectURL(f),
        isVideo: f.type.startsWith("video/"),
        name: f.name,
        isCompressing: true,
      }));
      setPendingPreviews((prev) => [...prev, ...previews]);

      // Pair each file with its preview for progress tracking
      const imagePairs = previews
        .map((p, i) => ({ preview: p, file: files[i] }))
        .filter(({ preview }) => !preview.isVideo);
      const videoPairs = previews
        .map((p, i) => ({ preview: p, file: files[i] }))
        .filter(({ preview }) => preview.isVideo);

      // Compress images in parallel, falling back to original on error
      const compressedImages = await Promise.all(
        imagePairs.map(async ({ preview, file }) => {
          let compressed = file;
          try {
            compressed = await compressImage(file);
          } catch {
            // fall back to original file
          }
          setPendingPreviews((prev) =>
            prev.map((p) => (p.id === preview.id ? { ...p, isCompressing: false } : p)),
          );
          return compressed;
        }),
      );

      // Compress videos sequentially to avoid memory pressure
      const compressedVideos: File[] = [];
      for (const { preview, file } of videoPairs) {
        let compressed = file;
        try {
          compressed = await compressVideo(file, (pct) => {
            setPendingPreviews((prev) =>
              prev.map((p) =>
                p.id === preview.id ? { ...p, compressionProgress: pct } : p,
              ),
            );
          });
        } catch {
          // fall back to original file
        }
        setPendingPreviews((prev) =>
          prev.map((p) => (p.id === preview.id ? { ...p, isCompressing: false } : p)),
        );
        compressedVideos.push(compressed);
      }

      const input = { traineeId, plannedWorkoutId };
      if (compressedImages.length) await startUpload(compressedImages, input);
      if (compressedVideos.length) await startVideoUpload(compressedVideos, input);

      if (inputRef.current) inputRef.current.value = "";
    },
    [startUpload, startVideoUpload, traineeId, plannedWorkoutId],
  );

  const removeUrl = (urlToRemove: string) => {
    // Fire-and-forget: delete the file from UploadThing storage
    fetch("/api/uploadthing/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileKeys: [extractFileKey(urlToRemove)] }),
    }).catch(() => {});
    onUploadComplete(mediaUrls.filter((u) => u !== urlToRemove));
  };

  const isCompressing = pendingPreviews.some((p) => p.isCompressing);
  const uploading = isUploading || isVideoUploading;
  const disabled = isPending || uploading || isCompressing;
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

          {/* Pending previews — shown immediately on file selection */}
          {pendingPreviews.map((preview) =>
            preview.isVideo ? (
              <div
                key={preview.id}
                className="relative flex items-center gap-2 border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2"
              >
                <Loader2Icon className="h-4 w-4 shrink-0 animate-spin text-[var(--shell-muted)]" />
                <span className="max-w-[140px] truncate text-xs text-[var(--shell-muted)]">
                  {preview.isCompressing
                    ? preview.compressionProgress != null
                      ? `Compressing ${preview.compressionProgress}%`
                      : "Compressing..."
                    : preview.name}
                </span>
              </div>
            ) : (
              <div key={preview.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.localUrl}
                  alt={preview.isCompressing ? "Compressing..." : "Uploading..."}
                  className="h-20 w-20 border-2 border-[var(--shell-border)] object-cover opacity-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2Icon className="h-5 w-5 animate-spin text-[var(--shell-ink)]" />
                  {preview.isCompressing && (
                    <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--shell-ink)]">
                      Compressing
                    </span>
                  )}
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
          {isCompressing ? (
            <>
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              Compressing...
            </>
          ) : uploading ? (
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
