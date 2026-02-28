import { PlannedWorkout } from "@/services/plannedWorkouts/type";
import { Card, CardHeader, CardContent } from "../ui/card";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlannedWorkout } from "@/services/plannedWorkouts/updatePlannedWorkout";
import { CheckCircle2Icon, RotateCcwIcon } from "lucide-react";

type Props = {
  workout: PlannedWorkout;
  viewerMode?: "athlete" | "coach";
  isHighlighted?: boolean;
};

export function Workout({
  workout,
  viewerMode = "athlete",
  isHighlighted = false,
}: Props) {
  const queryClient = useQueryClient();
  const [isLogging, setIsLogging] = useState(false);
  const [completionNote, setCompletionNote] = useState(workout.completionNote ?? "");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNote, setReviewNote] = useState(workout.reviewNote ?? "");

  const saveCompletion = useMutation({
    mutationFn: async ({
      completedAt,
      completionNote,
    }: {
      completedAt: Date | null;
      completionNote: string | null;
    }) =>
      updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          completedAt,
          completionNote,
        },
      }),
    onSuccess: async () => {
      setIsLogging(false);
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
    },
  });
  const saveReview = useMutation({
    mutationFn: async ({
      reviewedAt,
      reviewNote,
    }: {
      reviewedAt: Date | null;
      reviewNote: string | null;
    }) =>
      updatePlannedWorkout({
        plannedWorkout: {
          ...workout,
          reviewedAt,
          reviewNote,
        },
      }),
    onSuccess: async () => {
      setIsReviewing(false);
      await queryClient.invalidateQueries({ queryKey: ["planned-workouts"] });
    },
  });

  const date = useMemo(() => {
    const [year, month, day] = workout.plannedAt.split("-");

    return dayjs()
      .year(Number(year))
      .month(Number(month) - 1)
      .date(Number(day));
  }, [workout.plannedAt]);

  const displayName = useMemo(() => {
    const today = dayjs();
    const diff = date.diff(today, "days");

    switch (diff) {
      case -1:
        return "Yesterday";

      case 0:
        return "Today";

      case 1:
        return "Tomorrow";

      default:
        return date.format("dddd, D MMM YYYY");
    }
  }, [date]);

  const isCompleted = !!workout.completedAt;
  const isReviewed = !!workout.reviewedAt;

  useEffect(() => {
    setCompletionNote(workout.completionNote ?? "");
    setReviewNote(workout.reviewNote ?? "");
  }, [workout.completionNote, workout.reviewNote]);

  useEffect(() => {
    if (!isHighlighted) {
      return;
    }

    const element = document.getElementById(`workout-${workout.id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isHighlighted, workout.id]);

  return (
    <Card
      id={`workout-${workout.id}`}
      data-today={displayName === "Today"}
      className={
        isHighlighted
          ? "overflow-hidden border-zinc-400 bg-zinc-900/90 ring-1 ring-zinc-300/50"
          : "overflow-hidden bg-white/10"
      }
    >
      <CardHeader className="font-bold over p-4">
        <div className="flex items-center justify-between">
          {displayName}
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-700/60 bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                <CheckCircle2Icon className="h-3 w-3" />
                Completed
              </span>
            ) : null}
            {viewerMode === "coach" && isReviewed ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-200">
                Reviewed
              </span>
            ) : null}
            {displayName === "Today" ? (
              <div className="h-3 w-3 rounded-full bg-red-700" />
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid gap-4 bg-black rounded-t-lg">
        <div className="flex flex-wrap items-center gap-2">
          {viewerMode === "athlete" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setCompletionNote(workout.completionNote ?? "");
                  setIsLogging((x) => !x);
                }}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-zinc-800"
              >
                {isCompleted ? "Update log" : "Log workout"}
              </button>
              {isCompleted ? (
                <button
                  type="button"
                  disabled={saveCompletion.isPending}
                  onClick={() =>
                    saveCompletion.mutate({
                      completedAt: null,
                      completionNote: workout.completionNote ?? null,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-60"
                >
                  <RotateCcwIcon className="h-3.5 w-3.5" />
                  Reopen
                </button>
              ) : null}
            </>
          ) : isCompleted ? (
            <>
              {!isReviewed ? (
                <button
                  type="button"
                  disabled={saveReview.isPending}
                  onClick={() =>
                    saveReview.mutate({
                      reviewedAt: new Date(),
                      reviewNote: reviewNote.trim() || null,
                    })
                  }
                  className="rounded-lg border border-zinc-700 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                >
                  {saveReview.isPending ? "Saving..." : "Mark reviewed"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saveReview.isPending}
                  onClick={() =>
                    saveReview.mutate({
                      reviewedAt: null,
                      reviewNote: reviewNote.trim() || null,
                    })
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-60"
                >
                  {saveReview.isPending ? "Saving..." : "Unmark reviewed"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsReviewing((x) => !x)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-900"
              >
                {isReviewing ? "Hide review details" : "Review details"}
              </button>
            </>
          ) : null}
          {workout.completedAt ? (
            <span className="text-xs text-zinc-500">
              Logged {new Date(workout.completedAt).toLocaleString()}
            </span>
          ) : null}
          {viewerMode === "coach" && workout.reviewedAt ? (
            <span className="text-xs text-zinc-500">
              Reviewed {new Date(workout.reviewedAt).toLocaleString()}
            </span>
          ) : null}
        </div>

        {isLogging ? (
          <div className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Completion notes
              </p>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={3}
                placeholder="How did the workout feel? Any adjustments or results?"
                className="mt-2 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saveCompletion.isPending}
                onClick={() =>
                  saveCompletion.mutate({
                    completedAt: new Date(),
                    completionNote: completionNote.trim() || null,
                  })
                }
                className="rounded-lg border border-zinc-700 bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
              >
                {saveCompletion.isPending ? "Saving..." : "Mark completed"}
              </button>
              <button
                type="button"
                disabled={saveCompletion.isPending}
                onClick={() => setIsLogging(false)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {workout.note?.trim() ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Coach note
            </p>
            <p className="mt-1 text-sm text-zinc-200">{workout.note}</p>
          </div>
        ) : null}
        {workout.completionNote?.trim() ? (
          <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300/80">
              {viewerMode === "coach" ? "Athlete log" : "Your log"}
            </p>
            <p className="mt-1 text-sm text-zinc-100">{workout.completionNote}</p>
          </div>
        ) : null}
        {viewerMode === "coach" && isReviewing && !workout.completionNote?.trim() ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-400">
            Athlete completed this workout without a completion note.
          </div>
        ) : null}
        {viewerMode === "coach" && isReviewing ? (
          <div className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Coach log
              </p>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                placeholder="Feedback for the athlete, notes for follow-up, or coaching observations."
                className="mt-2 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saveReview.isPending}
                onClick={() =>
                  saveReview.mutate({
                    reviewedAt: workout.reviewedAt ? new Date(workout.reviewedAt) : null,
                    reviewNote: reviewNote.trim() || null,
                  })
                }
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {saveReview.isPending ? "Saving..." : "Save coach log"}
              </button>
            </div>
          </div>
        ) : null}
        {viewerMode === "coach" && workout.reviewNote?.trim() && !isReviewing ? (
          <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/70 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Coach log
            </p>
            <p className="mt-1 text-sm text-zinc-100">{workout.reviewNote}</p>
          </div>
        ) : null}
        {viewerMode === "athlete" && workout.reviewNote?.trim() ? (
          <div className="rounded-lg border border-blue-900/60 bg-blue-950/20 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300/80">
              Coach feedback
            </p>
            <p className="mt-1 text-sm text-zinc-100">{workout.reviewNote}</p>
          </div>
        ) : null}
        {workout.exercises.map((exercise, index) => (
          <div key={exercise.id} className="grid gap-2">
            <div className="flex items-center gap-4">
              <div className="bg-accent font-bold h-8 w-8 grid place-items-center rounded">
                {index + 1}
              </div>
              <div className="font-bold text-sm">{exercise.name}</div>
            </div>
            {exercise.note?.trim() ? (
              <div className="ml-12 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
                {exercise.note}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
