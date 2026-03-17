import { ImageIcon, VideoIcon, ZapIcon } from "lucide-react";

const points = [
  {
    icon: ImageIcon,
    label: "Up to 10 photos",
    detail: "Attach images to any completed workout — coaches see exactly what was done.",
  },
  {
    icon: VideoIcon,
    label: "Up to 10 videos",
    detail: "Record a set and upload the clip. Form checks and technique feedback made easy.",
  },
  {
    icon: ZapIcon,
    label: "Instant previews",
    detail: "Thumbnails appear the moment you select files, before the upload even starts.",
  },
];

export const MediaUploadSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="font-[var(--font-display)] max-w-lg text-3xl text-[var(--home-text)] md:text-4xl">
            Show your work with photos &amp; videos
          </h2>
          <p className="max-w-sm text-[var(--home-muted)]">
            Athletes document their sessions. Coaches review progress. All media lives alongside the
            workout it belongs to.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {points.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="border-2 border-[var(--home-border)] bg-[var(--home-surface)] p-6 transition-colors hover:bg-[var(--home-surface-strong)]"
            >
              <div className="mb-4 inline-flex border-2 border-[var(--home-border)] bg-[var(--home-surface-strong)] p-2.5">
                <Icon className="h-5 w-5 text-[var(--home-accent)]" />
              </div>
              <h3 className="mb-2 text-xl text-[var(--home-text)]">{label}</h3>
              <p className="text-[var(--home-muted)]">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
