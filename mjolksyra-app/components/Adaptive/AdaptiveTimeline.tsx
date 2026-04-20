"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/services/client";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";

const exerciseSchema = z.object({
  name: z.string(),
});

const workoutSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  plannedAt: z.string(),
  appliedBlock: z
    .object({
      blockName: z.string(),
      weekNumber: z.number(),
      totalWeeks: z.number(),
    })
    .nullable()
    .optional(),
  publishedExercises: z.array(exerciseSchema).default([]),
  completedAt: z.string().nullable().optional(),
});

const timelineSchema = z.object({
  data: z.array(workoutSchema),
});

type Workout = z.infer<typeof workoutSchema>;

type Props = {
  traineeId: string;
  accessToken: string;
};

async function fetchTimeline(traineeId: string, accessToken: string) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7);
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 84);

  const response = await ApiClient.get(
    `/api/trainees/${traineeId}/planned-workouts`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        fromDate: fromDate.toISOString().split("T")[0],
        toDate: toDate.toISOString().split("T")[0],
        size: 100,
        page: 0,
      },
    }
  );

  const parsed = await timelineSchema.safeParseAsync(response.data);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}

function groupByBlock(workouts: Workout[]) {
  const groups: Record<string, { blockName: string; workouts: Workout[] }> = {};
  const noBlock: Workout[] = [];

  for (const w of workouts) {
    if (w.appliedBlock) {
      const key = w.appliedBlock.blockName;
      if (!groups[key]) groups[key] = { blockName: key, workouts: [] };
      groups[key].workouts.push(w);
    } else {
      noBlock.push(w);
    }
  }

  return { groups: Object.values(groups), noBlock };
}

export function AdaptiveTimeline({ traineeId, accessToken }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adaptive-timeline", traineeId],
    queryFn: () => fetchTimeline(traineeId, accessToken),
  });

  if (isLoading) {
    return (
      <div className="px-8 py-16 max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-[#f5f5f5] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-8 py-16 max-w-2xl mx-auto">
        <p className="text-sm text-[#6b7280]">Failed to load timeline.</p>
      </div>
    );
  }

  const { groups, noBlock } = groupByBlock(data.data);
  const allWorkouts = data.data;

  if (allWorkouts.length === 0) {
    return (
      <div className="px-8 py-16 max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Timeline</p>
            <h1 className="text-3xl font-semibold tracking-tight">No workouts yet</h1>
          </div>
          <p className="text-sm text-[#6b7280]">
            Head to your AI coach to generate your first training block.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-16 max-w-2xl mx-auto">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Timeline</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your training</h1>
        </div>

        {groups.map(({ blockName, workouts }) => {
          const completed = workouts.filter((w) => w.completedAt).length;
          const total = workouts.length;
          const pct = Math.round((completed / total) * 100);

          return (
            <div key={blockName} className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Block</p>
                  <p className="font-semibold text-[#0a0a0a]">{blockName}</p>
                </div>
                <p className="text-xs text-[#6b7280]">{completed}/{total} done</p>
              </div>

              <div className="w-full h-px bg-[#f0f0f0] mb-4">
                <div
                  className="h-px bg-[#0a0a0a] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex flex-col divide-y divide-[#f0f0f0]">
                {workouts.map((w) => {
                  const done = !!w.completedAt;
                  const date = parseISO(w.plannedAt);
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <div
                      key={w.id}
                      className="flex items-center gap-4 py-3"
                    >
                      {done ? (
                        <CheckCircle2 size={16} className="text-[#0a0a0a] flex-shrink-0" />
                      ) : (
                        <Circle size={16} className="text-[#d1d5db] flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${done ? "text-[#6b7280] line-through" : "text-[#0a0a0a]"}`}>
                          {w.name ?? "Workout"}
                        </p>
                        <p className="text-xs text-[#6b7280] mt-0.5">
                          {w.publishedExercises.slice(0, 3).map((e) => e.name).join(" · ")}
                          {w.publishedExercises.length > 3 && ` +${w.publishedExercises.length - 3} more`}
                        </p>
                      </div>
                      <p className={`text-xs flex-shrink-0 ${isToday ? "font-semibold text-[#0a0a0a]" : "text-[#6b7280]"}`}>
                        {isToday ? "Today" : format(date, "EEE d MMM")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
