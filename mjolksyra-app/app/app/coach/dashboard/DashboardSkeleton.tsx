import { CoachWorkspaceShell } from "../CoachWorkspaceShell";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <CoachWorkspaceShell>
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonBlock className="h-36 w-full" />
          <SkeletonBlock className="h-36 w-full" />
          <SkeletonBlock className="h-36 w-full" />
          <SkeletonBlock className="h-36 w-full" />
        </section>

        <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 md:p-7">
          <div className="space-y-3">
            <SkeletonBlock className="h-5 w-44 border-0" />
            <SkeletonBlock className="h-12 w-72 border-0" />
            <SkeletonBlock className="h-5 w-full max-w-2xl border-0" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-24 w-full" />
          </div>
        </section>

        <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 md:p-7">
          <div className="space-y-3">
            <SkeletonBlock className="h-5 w-44 border-0" />
            <SkeletonBlock className="h-8 w-96 border-0" />
            <SkeletonBlock className="h-4 w-full max-w-2xl border-0" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
        </section>
      </div>
    </CoachWorkspaceShell>
  );
}
