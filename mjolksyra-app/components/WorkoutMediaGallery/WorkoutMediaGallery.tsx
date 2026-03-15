"use client";

type Props = {
  mediaUrls: string[];
};

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi)(\?.*)?$/i.test(url);
}

export function WorkoutMediaGallery({ mediaUrls }: Props) {
  if (!mediaUrls.length) return null;

  const images = mediaUrls.filter((u) => !isVideoUrl(u));
  const videos = mediaUrls.filter((u) => isVideoUrl(u));

  return (
    <div className="grid gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]">
        Media
      </p>

      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt="Workout media"
                className="h-24 w-24 border-2 border-[var(--shell-border)] object-cover transition hover:opacity-90 sm:h-32 sm:w-32"
              />
            </a>
          ))}
        </div>
      ) : null}

      {videos.length > 0 ? (
        <div className="grid gap-2">
          {videos.map((url) => (
            <video
              key={url}
              src={url}
              controls
              className="w-full max-w-md border-2 border-[var(--shell-border)]"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
