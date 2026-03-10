"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import {
  Loader2Icon,
  SearchIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchExercises as searchExercisesService, type SearchExercises } from "@/services/exercises/searchExercises";
import type { Exercise } from "@/services/exercises/type";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: Exercise) => Promise<void> | void;
  title?: string;
  searchExercisesFn?: SearchExercises;
};

export function ExerciseQuickSearchOverlay({
  open,
  onOpenChange,
  onSelectExercise,
  title = "Find exercise",
  searchExercisesFn,
}: Props) {
  const [search, setSearch] = useState("");
  const trimmedSearch = search.trim();

  const { data, isLoading } = useQuery({
    queryKey: ["exercise-quick-search", trimmedSearch],
    queryFn: ({ signal }) =>
      (searchExercisesFn ?? searchExercisesService)({
        freeText: trimmedSearch,
        filters: {
          force: null,
          level: null,
          mechanic: null,
          category: null,
          createdByMe: false,
        },
        signal,
      }),
    enabled: open,
  });

  const exercises = useMemo(() => data?.data ?? [], [data?.data]);
  const hasSearch = trimmedSearch.length > 0;
  const hasResults = exercises.length > 0;
  const shouldShowBody = isLoading || hasSearch || hasResults;

  const handleSelect = useCallback(
    async (exercise: Exercise) => {
      await onSelectExercise(exercise);
      onOpenChange(false);
      setSearch("");
    },
    [onOpenChange, onSelectExercise],
  );

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      return;
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/60"
        className="w-[min(52rem,92vw)] max-w-none gap-0 overflow-hidden rounded-none border-4 border-[var(--shell-border)] bg-[var(--shell-surface)] p-0 text-[var(--shell-ink)] [&>button]:hidden"
      >
        <DialogHeader className="space-y-0 border-b-4 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
          <DialogTitle className="font-[var(--font-display)] text-lg uppercase tracking-[0.12em] text-[var(--shell-ink)] md:text-xl">
            {title}
          </DialogTitle>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--shell)]">
            Search and add exercises to the workout plan.
          </p>
        </DialogHeader>

        <div className="px-0 py-0">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shell-muted)]" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type an exercise name..."
              className="h-full min-h-14 w-full rounded-none border-0 border-b-4 border-[var(--shell-border)] bg-[var(--shell-surface)] pl-8 pr-3 text-sm font-semibold text-[var(--shell-ink)] placeholder:font-medium placeholder:text-[var(--shell-muted)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          <div
            className={`transition-all duration-200 ease-out ${
              shouldShowBody
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1 opacity-0"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-4 text-sm text-[var(--shell-muted)]">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Loading exercises...
              </div>
            ) : hasResults ? (
              <div>
                <div className="border-b-4 border-[var(--shell-border)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                  Results {hasSearch ? `(${exercises.length})` : ""}
                </div>
                {exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={async () => handleSelect(exercise)}
                    className="group flex w-full items-center justify-between gap-3 border-b-2 border-[var(--shell-border)] px-4 py-3 text-left transition hover:bg-[var(--shell-surface-strong)] focus-visible:bg-[var(--shell-surface-strong)]"
                  >
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-bold uppercase tracking-[0.04em] text-[var(--shell-ink)]">
                        {exercise.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--shell-muted)]">
                        Add to current day
                      </span>
                    </div>
                    <span className="shrink-0 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition group-hover:bg-[var(--shell-ink)] group-hover:text-[var(--shell-surface)]">
                      Enter
                    </span>
                  </button>
                ))}
              </div>
            ) : hasSearch ? (
              <div className="px-4 py-4 text-sm text-[var(--shell-muted)]">
                No exercises found.
              </div>
            ) : null}
          </div>
        </div>

        <div className={`flex flex-wrap items-center justify-end gap-3 bg-[var(--shell-surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] ${shouldShowBody ? "border-t-4 border-[var(--shell-border)]" : ""}`}>
          <span>Press Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
