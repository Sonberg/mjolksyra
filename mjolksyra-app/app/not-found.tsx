import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--shell-muted)]">
          404
        </p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl tracking-tight text-[var(--shell-ink)]">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-[var(--shell-muted)]">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/app"
            className="inline-flex items-center rounded-none border border-[var(--shell-border)] bg-[var(--shell-ink)] px-4 py-2 text-sm font-medium text-[var(--shell-surface)] transition hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
