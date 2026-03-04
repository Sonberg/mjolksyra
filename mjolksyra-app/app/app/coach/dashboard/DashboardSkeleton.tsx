function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-none bg-[var(--shell-surface-strong)] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-9 w-72" />
          <SkeletonBlock className="h-4 w-full max-w-xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SkeletonBlock className="h-28 w-full rounded-none" />
          <SkeletonBlock className="h-28 w-full rounded-none" />
          <SkeletonBlock className="h-28 w-full rounded-none" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonBlock className="h-72 w-full rounded-none" />
          <SkeletonBlock className="h-72 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}
