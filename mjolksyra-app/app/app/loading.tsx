function SkeletonRow({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <SkeletonRow className="h-5 w-40" />
          <SkeletonRow className="h-8 w-64" />
          <SkeletonRow className="h-4 w-full max-w-xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonRow className="h-28 w-full" />
          <SkeletonRow className="h-28 w-full" />
          <SkeletonRow className="h-28 w-full" />
        </div>

        <SkeletonRow className="h-[26rem] w-full" />
      </div>
    </div>
  );
}
