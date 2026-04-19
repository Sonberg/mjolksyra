import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-8 px-4 py-6 md:px-6">
      <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 md:p-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-44 rounded-none" />
          <Skeleton className="h-10 w-72 rounded-none" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-none" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-32 w-full rounded-none" />
        <Skeleton className="h-32 w-full rounded-none" />
        <Skeleton className="h-32 w-full rounded-none" />
      </section>

      <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 md:p-6">
        <Skeleton className="h-10 w-64 rounded-none" />
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
        </div>
      </section>

      <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5 md:p-6">
        <Skeleton className="h-[18rem] w-full rounded-none" />
      </section>
    </div>
  );
}
