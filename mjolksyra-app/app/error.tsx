"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex h-full w-full overflow-auto bg-[var(--shell-bg)] px-4 py-8 md:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center">
        <div className="w-full border border-[var(--shell-border)] bg-[var(--shell-surface)] p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)]">
            Error 500
          </p>
          <h1 className="mt-3 font-[var(--font-display)] text-4xl leading-[0.95] text-[var(--shell-ink)] md:text-6xl">
            SOMETHING WENT WRONG
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--shell-muted)] md:text-base">
            An unexpected error occurred while loading this page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center border border-[var(--shell-border)] bg-[var(--shell-ink)] px-4 py-2 text-sm font-semibold text-[var(--shell-surface)] transition hover:bg-black"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)]"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

