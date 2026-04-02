"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { WorkoutMediaThumbnail } from "@/components/WorkoutMediaThumbnail/WorkoutMediaThumbnail";

type PlannedWorkoutMedia = PlannedWorkout["media"][number];

type Props = {
  media: PlannedWorkoutMedia[];
  thumbnailSize?: "default" | "small";
};

type MediaItem = {
  url: string;
  isVideo: boolean;
};

export function WorkoutMediaGallery({ media, thumbnailSize = "default" }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allMedia: MediaItem[] = media.map((item) => ({
    url: item.compressedUrl ?? item.rawUrl,
    isVideo: item.type === "Video",
  }));

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + allMedia.length) % allMedia.length));
  }, [allMedia.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % allMedia.length));
  }, [allMedia.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, prev, next]);

  if (!media.length) return null;

  const activeItem = lightboxIndex !== null ? allMedia[lightboxIndex] : null;

  return (
    <>
      <div className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          {allMedia.map((item, idx) => (
            <WorkoutMediaThumbnail
              key={item.url}
              src={item.url}
              alt={`Workout media ${idx + 1}`}
              isVideo={item.isVideo}
              size={thumbnailSize}
              onClick={() => setLightboxIndex(idx)}
              buttonProps={{
                "aria-label": `${item.isVideo ? "Play video" : "View image"} ${idx + 1}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Unified lightbox — images and videos share the same modal slider */}
      {activeItem !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <div
            className="relative flex max-h-screen max-w-screen-lg flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close preview"
            >
              <XIcon className="h-4 w-4" />
            </button>

            {/* Active item — key forces video to remount when navigating between clips */}
            {activeItem.isVideo ? (
              <video
                key={activeItem.url}
                src={activeItem.url}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="max-h-[85vh] max-w-[90vw]"
              />
            ) : (
              <img
                src={activeItem.url}
                alt={`Workout media ${lightboxIndex! + 1}`}
                className="max-h-[85vh] max-w-[90vw] object-contain"
              />
            )}

            {/* Counter + navigation */}
            {allMedia.length > 1 ? (
              <div className="mt-3 flex items-center gap-4">
                <button
                  type="button"
                  onClick={prev}
                  className="flex h-8 w-8 items-center justify-center bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Previous"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold tabular-nums text-white/70">
                  {lightboxIndex! + 1} / {allMedia.length}
                </span>
                <button
                  type="button"
                  onClick={next}
                  className="flex h-8 w-8 items-center justify-center bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Next"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
