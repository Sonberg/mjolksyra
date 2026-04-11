"use client";

import { useCallback, useState } from "react";
import { CompletedWorkout } from "@/services/completedWorkouts/type";
import { WorkoutMediaThumbnail } from "@/components/WorkoutMediaThumbnail/WorkoutMediaThumbnail";
import { WorkoutMediaLightbox } from "@/components/WorkoutMediaGallery/WorkoutMediaLightbox";

type PlannedWorkoutMedia = NonNullable<CompletedWorkout["media"]>[number];

type Props = {
  media: PlannedWorkoutMedia[];
  thumbnailSize?: "default" | "small";
  thumbnailClassName?: string;
};

type MediaItem = {
  url: string;
  isVideo: boolean;
};

export function WorkoutMediaGallery({ media, thumbnailSize = "default", thumbnailClassName }: Props) {
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

  if (!media.length) return null;

  const activeItem = lightboxIndex !== null ? allMedia[lightboxIndex] : null;

  return (
    <>
      <div className="grid gap-1">
        <div className="flex flex-wrap gap-1">
          {allMedia.map((item, idx) => (
            <WorkoutMediaThumbnail
              key={item.url}
              src={item.url}
              alt={`Workout media ${idx + 1}`}
              isVideo={item.isVideo}
              size={thumbnailSize}
              className={thumbnailClassName}
              onClick={() => setLightboxIndex(idx)}
              buttonProps={{
                "aria-label": `${item.isVideo ? "Play video" : "View image"} ${idx + 1}`,
              }}
            />
          ))}
        </div>
      </div>

      {activeItem !== null ? (
        <WorkoutMediaLightbox
          isOpen
          mediaUrl={activeItem.url}
          isVideo={activeItem.isVideo}
          currentIndex={lightboxIndex ?? 0}
          totalCount={allMedia.length}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      ) : null}
    </>
  );
}
