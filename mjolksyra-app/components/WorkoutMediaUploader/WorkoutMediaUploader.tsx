"use client";

import { requestPresignedUrl, uploadToR2, extractR2Key } from "@/lib/r2";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, VideoIcon, XIcon, Loader2Icon } from "lucide-react";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";

type PlannedWorkoutMedia = PlannedWorkout["media"][number];

type Props = {
  traineeId: string;
  plannedWorkoutId: string;
  media: PlannedWorkoutMedia[];
  onUploadComplete: (media: PlannedWorkoutMedia[]) => void;
  isPending?: boolean;
  onPendingChange?: (hasPending: boolean) => void;
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
  plannedWorkoutId,
  media,
  onUploadComplete,
  isPending,
  onPendingChange,
  _testPendingPreviews,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>(
    _testPendingPreviews ?? [],
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    onPendingChange?.(isUploading);
  }, [isUploading, onPendingChange]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      // Show local previews immediately
      const previews: PendingPreview[] = files.map((f) => ({
        id: crypto.randomUUID(),
        localUrl: URL.createObjectURL(f),
        isVideo: f.type.startsWith("video/"),
        name: f.name,
      }));
      setPendingPreviews((prev) => [...prev, ...previews]);
      setIsUploading(true);

      if (inputRef.current) inputRef.current.value = "";

      try {
        const uploaded = await uploadFiles(files, plannedWorkoutId);
        onUploadComplete([...media, ...uploaded]);
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
    [media, onUploadComplete],
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

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
        Media (optional)
      </p>

      {hasItems ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {/* Confirmed uploads */}
          {media.map((item) =>
            item.type === "Video" ? (
              <div
                key={item.rawUrl}
                className="relative flex items-center gap-2 border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2"
              >
                <VideoIcon className="h-4 w-4 shrink-0 text-[var(--shell-muted)]" />
                <span className="max-w-[140px] truncate text-xs text-[var(--shell-ink)]">
                  {getFilename(item.rawUrl)}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeMedia(item)}
                  className="ml-1 text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)] disabled:opacity-40"
                  aria-label="Remove video"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div key={item.rawUrl} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.compressedUrl ?? item.rawUrl}
                  alt="Workout media"
                  className="h-20 w-20 border-2 border-[var(--shell-border)] object-cover"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeMedia(item)}
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
                  Uploading...
                </span>
              </div>
            ) : (
              <div key={preview.id} className="relative">
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
          <ImageIcon className="h-3.5 w-3.5" />
          Add photos / videos
        </label>
      </div>
    </div>
  );
}

async function uploadFiles(files: File[], plannedWorkoutId: string): Promise<PlannedWorkoutMedia[]> {
  return Promise.all(
    files.map(async (file) => {
      const isVideo = file.type.startsWith("video/");
      const type = isVideo ? "video" : "image";
      const { presignedUrl, publicUrl } = await requestPresignedUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        type,
        plannedWorkoutId,
      });
      await uploadToR2(presignedUrl, file);
      return {
        rawUrl: `${publicUrl}?raw=1`,
        compressedUrl: null,
        type: isVideo ? ("Video" as const) : ("Image" as const),
      };
    }),
  );
}
