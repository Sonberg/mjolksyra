"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  isOpen: boolean;
  mediaUrl: string;
  isVideo: boolean;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function WorkoutMediaLightbox({
  isOpen,
  mediaUrl,
  isVideo,
  currentIndex,
  totalCount,
  onClose,
  onPrev,
  onNext,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-screen max-w-screen-lg flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute -right-3 -top-3 z-10 size-8 rounded-none bg-white/10 text-white hover:bg-white/20"
          aria-label="Close preview"
        >
          <XIcon data-icon />
        </Button>

        {isVideo ? (
          <video
            key={mediaUrl}
            src={mediaUrl}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="max-h-[85vh] max-w-[90vw]"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={`Workout media ${currentIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
        )}

        {totalCount > 1 ? (
          <div className="mt-3 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              className="size-8 rounded-none bg-white/10 text-white hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeftIcon data-icon />
            </Button>
            <span className="text-xs font-semibold tabular-nums text-white/70">
              {currentIndex + 1} / {totalCount}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="size-8 rounded-none bg-white/10 text-white hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRightIcon data-icon />
            </Button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
