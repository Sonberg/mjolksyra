"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { useCallback, useRef } from "react";
import { ImageIcon, VideoIcon, XIcon, UploadIcon } from "lucide-react";

type Props = {
  mediaUrls: string[];
  onUploadComplete: (urls: string[]) => void;
  isPending?: boolean;
};

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi)(\?.*)?$/i.test(url);
}

function getFilename(url: string) {
  try {
    const path = new URL(url).pathname;
    return path.split("/").pop() ?? url;
  } catch {
    return url;
  }
}

export function WorkoutMediaUploader({ mediaUrls, onUploadComplete, isPending }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("workoutImage", {
    onClientUploadComplete: (res) => {
      const newUrls = res.map((f) => f.ufsUrl);
      onUploadComplete([...mediaUrls, ...newUrls]);
    },
  });

  const { startUpload: startVideoUpload, isUploading: isVideoUploading } = useUploadThing(
    "workoutVideo",
    {
      onClientUploadComplete: (res) => {
        const newUrls = res.map((f) => f.ufsUrl);
        onUploadComplete([...mediaUrls, ...newUrls]);
      },
    },
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      const images = files.filter((f) => f.type.startsWith("image/"));
      const videos = files.filter((f) => f.type.startsWith("video/"));

      if (images.length) await startUpload(images);
      if (videos.length) await startVideoUpload(videos);

      if (inputRef.current) inputRef.current.value = "";
    },
    [startUpload, startVideoUpload, mediaUrls],
  );

  const removeUrl = (urlToRemove: string) => {
    onUploadComplete(mediaUrls.filter((u) => u !== urlToRemove));
  };

  const uploading = isUploading || isVideoUploading;
  const disabled = isPending || uploading;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
        Media (optional)
      </p>

      {mediaUrls.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
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
