"use client";

import { useState } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { SparklesIcon, RotateCcwIcon } from "lucide-react";
import type { PreviewWorkoutPlanWorkout } from "@/services/aiPlanner/types";

dayjs.extend(isoWeek);

type Props = {
  workouts: PreviewWorkoutPlanWorkout[];
  generateCost: number | null;
  isLoading: boolean;
  onGenerate: () => void;
  onRefine: (feedback: string) => void;
};

type WeekGroup = {
  weekLabel: string;
  weekRange: string;
  workouts: PreviewWorkoutPlanWorkout[];
};

function groupByWeek(workouts: PreviewWorkoutPlanWorkout[]): WeekGroup[] {
  const map = new Map<string, PreviewWorkoutPlanWorkout[]>();

  for (const workout of workouts) {
    const d = dayjs(workout.plannedAt);
    const key = `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, "0")}`;
    const existing = map.get(key) ?? [];
    map.set(key, [...existing, workout]);
  }

  const groups: WeekGroup[] = [];
  let weekIndex = 1;
  for (const [, weekWorkouts] of map) {
    const monday = dayjs(weekWorkouts[0].plannedAt).startOf("isoWeek" as dayjs.OpUnitType);
    const sunday = monday.add(6, "day");
    groups.push({
      weekLabel: `Week ${weekIndex}`,
      weekRange: `${monday.format("MMM D")} – ${sunday.format("MMM D")}`,
      workouts: weekWorkouts.sort((a, b) => a.plannedAt.localeCompare(b.plannedAt)),
    });
    weekIndex++;
  }

  return groups;
}

function formatSet(set: PreviewWorkoutPlanWorkout["exercises"][0]["sets"][0], type?: string): string {
  if (type === "DurationSeconds" && set.durationSeconds) {
    return `${set.durationSeconds}s`;
  }
  if (type === "DistanceMeters" && set.distanceMeters) {
    return `${set.distanceMeters}m`;
  }
  const parts: string[] = [];
  if (set.reps) parts.push(`${set.reps}`);
  if (set.weightKg) parts.push(`${set.weightKg}kg`);
  return parts.join(" @ ");
}

function formatPrescription(exercise: PreviewWorkoutPlanWorkout["exercises"][0]): string {
  if (!exercise.sets.length) return "";
  const type = exercise.prescriptionType;

  if (exercise.sets.length === 1) {
    return formatSet(exercise.sets[0], type ?? undefined);
  }

  // Check if all sets identical
  const first = formatSet(exercise.sets[0], type ?? undefined);
  const allSame = exercise.sets.every((s) => formatSet(s, type ?? undefined) === first);
  if (allSame) {
    return `${exercise.sets.length}×${first}`;
  }

  return exercise.sets.map((s) => formatSet(s, type ?? undefined)).join(", ");
}

export function WorkoutPlanPreview({ workouts, generateCost, isLoading, onGenerate, onRefine }: Props) {
  const [feedback, setFeedback] = useState("");
  const weeks = groupByWeek(workouts);

  function handleRefine() {
    const text = feedback.trim();
    if (!text) return;
    onRefine(text);
    setFeedback("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-[var(--shell-border)] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Plan Preview
        </p>
        <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
          {workouts.length === 0
            ? "No workouts were generated."
            : `${workouts.length} workout${workouts.length !== 1 ? "s" : ""} across ${weeks.length} week${weeks.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Week list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {workouts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[var(--shell-muted)]">
            The AI didn&apos;t return any workouts. Try refining your description.
          </p>
        ) : (
          weeks.map((week) => (
            <div key={week.weekLabel} className="border-b border-[var(--shell-border)] px-4 py-3">
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-ink)]">
                  {week.weekLabel}
                </span>
                <span className="text-[10px] text-[var(--shell-muted)]">{week.weekRange}</span>
              </div>
              <div className="flex flex-col gap-2">
                {week.workouts.map((workout) => (
                  <div key={workout.plannedAt}>
                    <p className="text-xs font-medium text-[var(--shell-ink)]">
                      {dayjs(workout.plannedAt).format("ddd, MMM D")}
                      {workout.name && (
                        <span className="ml-1.5 font-normal text-[var(--shell-muted)]">— {workout.name}</span>
                      )}
                    </p>
                    {workout.exercises.length > 0 && (
                      <ul className="mt-1 space-y-0.5 pl-3">
                        {workout.exercises.map((exercise, i) => {
                          const prescription = formatPrescription(exercise);
                          return (
                            <li key={i} className="flex items-baseline gap-1.5 text-xs text-[var(--shell-muted)]">
                              <span className="text-[var(--shell-ink)]">{exercise.name}</span>
                              {prescription && <span>·</span>}
                              {prescription && <span>{prescription}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback + actions */}
      <div className="border-t border-[var(--shell-border)] px-4 py-3">
        <textarea
          className="w-full resize-none rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-ink)] placeholder:text-[var(--shell-muted)] focus:border-[var(--shell-ink)] focus:outline-none disabled:opacity-50"
          rows={2}
          placeholder="Give feedback to refine the plan…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleRefine();
            }
          }}
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={!feedback.trim() || isLoading}
            className="inline-flex items-center gap-1.5 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)] transition hover:bg-[var(--shell-surface)] hover:text-[var(--shell-ink)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleRefine}
          >
            <RotateCcwIcon className="h-3 w-3" />
            Refine
          </button>
          <button
            type="button"
            disabled={isLoading || workouts.length === 0}
            className="ml-auto inline-flex items-center gap-1.5 rounded-none border border-transparent bg-[var(--shell-accent)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition hover:bg-[var(--shell-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onGenerate}
          >
            <SparklesIcon className="h-3 w-3" />
            {generateCost ? `Generate (${generateCost} cr)` : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
