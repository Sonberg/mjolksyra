function SkeletonRow({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800/80 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <SkeletonRow className="h-5 w-40" />
          <SkeletonRow className="h-8 w-64" />
          <SkeletonRow className="h-4 w-full max-w-xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonRow className="h-28 w-full rounded-2xl" />
          <SkeletonRow className="h-28 w-full rounded-2xl" />
          <SkeletonRow className="h-28 w-full rounded-2xl" />
        </div>

        <SkeletonRow className="h-[26rem] w-full rounded-2xl" />
      </div>
    </div>
  );
}
