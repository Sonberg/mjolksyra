"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon, PlayIcon } from "lucide-react";
import { isVideoUrl } from "@/components/WorkoutMediaUploader/WorkoutMediaUploader";

type Props = {
  mediaUrls: string[];
};

type MediaItem = {
  url: string;
  isVideo: boolean;
};

export function WorkoutMediaGallery({ mediaUrls }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allMedia: MediaItem[] = mediaUrls.map((url) => ({
    url,
    isVideo: isVideoUrl(url),
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

  if (!mediaUrls.length) return null;

  const activeItem = lightboxIndex !== null ? allMedia[lightboxIndex] : null;

  return (
    <>
      <div className="grid gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
          Media
        </p>

        <div className="flex flex-wrap gap-2">
          {allMedia.map((item, idx) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className="group relative h-24 w-24 overflow-hidden border border-[var(--shell-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)] sm:h-32 sm:w-32"
              aria-label={`${item.isVideo ? "Play video" : "View image"} ${idx + 1}`}
            >
              {item.isVideo ? (
                <>
                  {/* Loads first frame via preload="metadata" as the thumbnail */}
                  <video
                    src={item.url}
                    preload="metadata"
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85">
                      <PlayIcon className="h-3 w-3 translate-x-px text-[var(--shell-ink)]" />
                    </div>
                  </div>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={`Workout media ${idx + 1}`}
                  className="h-full w-full object-cover transition group-hover:opacity-90"
                />
              )}
            </button>
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
              // eslint-disable-next-line @next/next/no-img-element
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
