"use client";

import { requestPresignedUrl, uploadToR2, extractR2Key } from "@/lib/r2";
import {
  ACCEPTED_MEDIA_INPUT,
  getAcceptedMediaMimeType,
  isAcceptedMediaFile,
  isAcceptedVideoMimeType,
} from "@/lib/mediaUpload";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { CompletedWorkout } from "@/services/completedWorkouts/type";
import { WorkoutMediaThumbnail } from "@/components/WorkoutMediaThumbnail/WorkoutMediaThumbnail";

type PlannedWorkoutMedia = NonNullable<CompletedWorkout["media"]>[number];

type Props = {
  traineeId: string;
  workoutId: string;
  media: PlannedWorkoutMedia[];
  onUploadComplete: (media: PlannedWorkoutMedia[]) => void;
  isPending?: boolean;
  onPendingChange?: (hasPending: boolean) => void;
  compact?: boolean;
  /** @internal For Storybook and testing only. Pre-populates pending previews. */
  _testPendingPreviews?: PendingPreview[];
};

export type PendingPreview = {
  id: string;
  localUrl: string; // blob: URL for instant preview
  isVideo: boolean;
  name: string;
};

// R2 URLs have file extensions in the key (e.g. https://media.example.com/workouts/abc.mp4).
// Keep ?ct=video branch for legacy UploadThing URLs.
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
  workoutId,
  media,
  onUploadComplete,
  isPending,
  onPendingChange,
  compact,
  _testPendingPreviews,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>(
    _testPendingPreviews ?? [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragDepth, setDragDepth] = useState(0);

  const IMAGE_MAX_BYTES = 20 * 1024 * 1024; // 20 MB
  const VIDEO_MAX_BYTES = 256 * 1024 * 1024; // 256 MB

  useEffect(() => {
    onPendingChange?.(isUploading);
  }, [isUploading, onPendingChange]);

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (!files.length) {
        return;
      }

      const validFiles = files.filter((file) => isAcceptedMediaFile(file));

      if (!validFiles.length) {
        setUploadError("Only image and video files are supported here.");
        return;
      }

      if (validFiles.length !== files.length) {
        setUploadError("Some files were skipped. Only image and video files are supported here.");
      }

      // Client-side size validation
      for (const file of validFiles) {
        const mimeType = getAcceptedMediaMimeType(file);
        if (!mimeType) {
          setUploadError(`"${file.name}" is not a supported image or video.`);
          if (inputRef.current) inputRef.current.value = "";
          return;
        }

        const isVideo = isAcceptedVideoMimeType(mimeType);
        const maxBytes = isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
        if (file.size > maxBytes) {
          setUploadError(
            `"${file.name}" is too large. Max size for ${isVideo ? "video" : "image"}: ${maxBytes / 1024 / 1024} MB`,
          );
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
      }

      setUploadError(null);

      // Show local previews immediately
      const previews: PendingPreview[] = validFiles.map((f) => ({
        id: crypto.randomUUID(),
        localUrl: URL.createObjectURL(f),
        isVideo: isAcceptedVideoMimeType(getAcceptedMediaMimeType(f) ?? ""),
        name: f.name,
      }));
      setPendingPreviews((prev) => [...prev, ...previews]);
      setIsUploading(true);

      if (inputRef.current) inputRef.current.value = "";

      try {
        const uploaded = await uploadFiles(validFiles, workoutId);
        onUploadComplete([...media, ...uploaded]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        // Revoke blob URLs and clear pending previews
        setPendingPreviews((prev) => {
          const newPreviewIds = new Set(previews.map((p) => p.id));
          const toRevoke = prev.filter((p) => newPreviewIds.has(p.id));
          toRevoke.forEach((p) => { if (p.localUrl.startsWith("blob:")) URL.revokeObjectURL(p.localUrl); });
          return prev.filter((p) => !newPreviewIds.has(p.id));
        });
        setIsUploading(false);
      }
    },
    [IMAGE_MAX_BYTES, VIDEO_MAX_BYTES, media, onUploadComplete, workoutId],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleFilesSelected(Array.from(e.target.files ?? []));
    },
    [handleFilesSelected],
  );

  const removeMedia = (item: PlannedWorkoutMedia) => {
    // Fire-and-forget: delete the raw file from R2 storage
    fetch("/api/uploads/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys: [extractR2Key(item.rawUrl)] }),
    }).catch(() => {});
    onUploadComplete(media.filter((m) => m.rawUrl !== item.rawUrl));
  };

  const disabled = isPending;
  const hasItems = media.length > 0 || pendingPreviews.length > 0;
  const thumbnailSize = compact ? "xsmall" : "small";
  const isDragActive = dragDepth > 0;

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    if (disabled || !e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    setDragDepth((value) => value + 1);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (disabled || !e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (disabled || !e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    setDragDepth((value) => Math.max(0, value - 1));
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (disabled || !e.dataTransfer.files.length) {
      return;
    }

    e.preventDefault();
    setDragDepth(0);
    await handleFilesSelected(Array.from(e.dataTransfer.files));
  }

  return (
    <div
      data-testid="workout-media-dropzone"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => void handleDrop(e)}
      className={[
        "border border-dashed border-[var(--shell-border)] bg-[color-mix(in_srgb,var(--shell-surface)_86%,white_14%)] p-2 transition",
        isDragActive
          ? "border-[var(--shell-ink)] bg-[var(--shell-surface-strong)]"
          : "",
      ].join(" ")}
    >
      {hasItems ? (
        <div className={compact ? "mt-1.5 flex flex-wrap gap-1.5" : "mt-2 flex flex-wrap gap-2"}>
          {/* Confirmed uploads */}
          {media.map((item) =>
            item.type === "Video" ? (
              <WorkoutMediaThumbnail
                key={item.rawUrl}
                src={item.rawUrl}
                alt="Workout media"
                isVideo
                size={thumbnailSize}
                actionButton={
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeMedia(item)}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center bg-[var(--shell-surface)]/90 text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-40"
                    aria-label="Remove video"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                }
              />
            ) : (
              <WorkoutMediaThumbnail
                key={item.rawUrl}
                src={item.compressedUrl ?? item.rawUrl}
                alt="Workout media"
                size={thumbnailSize}
                actionButton={
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeMedia(item)}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center bg-[var(--shell-surface)]/90 text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-40"
                    aria-label="Remove image"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                }
              />
            ),
          )}

          {/* Pending previews — shown immediately on file selection */}
          {pendingPreviews.map((preview) =>
            <WorkoutMediaThumbnail
              key={preview.id}
              src={preview.isVideo ? undefined : preview.localUrl}
              alt="Uploading..."
              isVideo={preview.isVideo}
              isPending
              size={thumbnailSize}
            />,
          )}
        </div>
      ) : null}

      <div className={compact ? "mt-1.5" : "mt-2"}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MEDIA_INPUT}
          multiple
          disabled={disabled}
          onChange={handleFileChange}
          className="sr-only"
          id="workout-media-input"
        />
        <label
          htmlFor="workout-media-input"
          className={[
            "flex w-full cursor-pointer items-center justify-between gap-3 border bg-[var(--shell-surface)] px-3 py-3 transition hover:bg-[var(--shell-surface-strong)]",
            compact
              ? "border-[var(--shell-border)]"
              : "border-2 border-[var(--shell-border)]",
            isDragActive ? "border-[var(--shell-ink)] bg-[var(--shell-surface-strong)]" : "",
            disabled ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
              {isDragActive ? "Drop media here" : "Drag and drop media"}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--shell-muted)]">
              {isDragActive
                ? "Release to upload"
                : compact
                  ? "Click to choose a photo or video"
                  : "Click to choose files or drop images and videos here"}
            </p>
          </div>
          {compact ? (
            <ImageIcon className="h-4 w-4 shrink-0 text-[var(--shell-muted)]" />
          ) : (
            <UploadIcon className="h-4 w-4 shrink-0 text-[var(--shell-muted)]" />
          )}
        </label>
        <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--shell-muted)]">
          {compact ? "Tap or drop to add media" : "This whole area is clickable"}
        </p>
        {uploadError && (
          <p className="mt-1 text-xs text-red-500">{uploadError}</p>
        )}
      </div>
    </div>
  );
}

async function uploadFiles(files: File[], workoutId: string): Promise<PlannedWorkoutMedia[]> {
  return Promise.all(
    files.map(async (file) => {
      const mimeType = getAcceptedMediaMimeType(file);
      if (!mimeType) {
        throw new Error(`"${file.name}" is not a supported image or video.`);
      }

      const isVideo = isAcceptedVideoMimeType(mimeType);
      const type = isVideo ? "video" : "image";
      const { presignedUrl, publicUrl } = await requestPresignedUrl({
        fileName: file.name,
        contentType: mimeType,
        fileSize: file.size,
        type,
        workoutId,
      });
      await uploadToR2(presignedUrl, file, mimeType);
      return {
        rawUrl: `${publicUrl}?raw=1`,
        compressedUrl: null,
        type: isVideo ? ("Video" as const) : ("Image" as const),
      };
    }),
  );
}
