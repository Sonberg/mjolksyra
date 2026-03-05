import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex h-full w-full overflow-auto bg-[var(--shell-bg)] px-4 py-8 md:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center">
        <div className="w-full border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)]">
            Error 404
          </p>
          <h1 className="mt-3 font-[var(--font-display)] text-4xl leading-[0.95] text-[var(--shell-ink)] md:text-6xl">
            PAGE NOT FOUND
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--shell-muted)] md:text-base">
            The page you requested does not exist or has been moved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center border-2 border-[var(--shell-border)] bg-[var(--shell-ink)] px-4 py-2 text-sm font-semibold text-[var(--shell-surface)] transition hover:bg-black"
            >
              Go home
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)]"
            >
              Open app
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

