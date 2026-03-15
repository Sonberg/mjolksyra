"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

type Props = {
  mediaUrls: string[];
};

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi)(\?.*)?$/i.test(url);
}

export function WorkoutMediaGallery({ mediaUrls }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = mediaUrls.filter((u) => !isVideoUrl(u));
  const videos = mediaUrls.filter((u) => isVideoUrl(u));

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

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

  return (
    <>
      <div className="grid gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
          Media
        </p>

        {images.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((url, idx) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="group relative overflow-hidden border-2 border-[var(--shell-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)]"
                aria-label={`View image ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Workout media ${idx + 1}`}
                  className="h-24 w-24 object-cover transition group-hover:opacity-90 sm:h-32 sm:w-32"
                />
              </button>
            ))}
          </div>
        ) : null}

        {videos.length > 0 ? (
          <div className="grid gap-2">
            {videos.map((url) => (
              // preload="metadata" fetches only duration + dimensions upfront so
              // the seek bar renders immediately without downloading the full clip.
              // The browser then fires HTTP range requests when the user scrubs to
              // unbuffered positions — UploadThing's CDN supports Accept-Ranges.
              // playsInline prevents iOS Safari from forcing fullscreen on play.
              <video
                key={url}
                src={url}
                controls
                playsInline
                preload="metadata"
                className="w-full max-w-md border-2 border-[var(--shell-border)]"
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Stop propagation so clicks on the image/controls don't close */}
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

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex]}
              alt={`Workout media ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />

            {/* Counter + navigation */}
            {images.length > 1 ? (
              <div className="mt-3 flex items-center gap-4">
                <button
                  type="button"
                  onClick={prev}
                  className="flex h-8 w-8 items-center justify-center bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold tabular-nums text-white/70">
                  {lightboxIndex + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={next}
                  className="flex h-8 w-8 items-center justify-center bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Next image"
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
