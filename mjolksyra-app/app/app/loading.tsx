function SkeletonRow({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-6">
      <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 md:p-6">
        <div className="space-y-3">
          <SkeletonRow className="h-5 w-44 border-0" />
          <SkeletonRow className="h-10 w-72 border-0" />
          <SkeletonRow className="h-4 w-full max-w-2xl border-0" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonRow className="h-32 w-full" />
        <SkeletonRow className="h-32 w-full" />
        <SkeletonRow className="h-32 w-full" />
      </section>

      <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 md:p-6">
        <SkeletonRow className="h-10 w-64 border-0" />
        <div className="mt-4 space-y-3">
          <SkeletonRow className="h-20 w-full" />
          <SkeletonRow className="h-20 w-full" />
          <SkeletonRow className="h-20 w-full" />
        </div>
      </section>

      <section className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 md:p-6">
        <SkeletonRow className="h-[18rem] w-full" />
      </section>
      </div>
  );
}
