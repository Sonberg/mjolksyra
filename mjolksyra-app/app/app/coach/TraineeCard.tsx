"use client";

import { Trainee } from "@/services/trainees/type";
import { DumbbellIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import { useGravatar } from "@/hooks/useGravatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { cancelTrainee } from "@/services/trainees/cancelTrainee";

type TraineeCardProps = {
  trainee: Trainee;
};

export function TraineeCard({ trainee }: TraineeCardProps) {
  const router = useRouter();
  const url = useGravatar(trainee.athlete.email ?? "", 56);
  const cancel = useMutation({
    mutationKey: ["trainee", trainee.id, "cancel"],
    mutationFn: () => cancelTrainee({ traineeId: trainee.id }),
    onSettled: () => router.refresh(),
  });

  const metrics = [
    {
      label: "Next workout",
      value: trainee.nextWorkoutAt
        ? format(new Date(trainee.nextWorkoutAt), "MMM d")
        : "--",
    },
    {
      label: "Last workout",
      value: trainee.lastWorkoutAt
        ? format(new Date(trainee.lastWorkoutAt), "MMM d")
        : "--",
    },
    {
      label: "Last charged",
      value: trainee.lastWorkoutAt
        ? format(new Date(trainee.lastWorkoutAt), "MMM d")
        : "--",
    },
    {
      label: "Billing",
      value: "Coach plan",
    },
  ];

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 transition-all duration-300 hover:border-cyan-200/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-center gap-4 px-5 py-5 md:px-6">
        <Avatar className="h-12 w-12 border border-white/15">
          <AvatarImage src={url} alt={trainee.athlete.name} />
          <AvatarFallback className="bg-zinc-800 text-zinc-100">
            {trainee.athlete.givenName?.[0] || trainee.athlete.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-zinc-100 transition-colors group-hover:text-white">
            {trainee.athlete.givenName
              ? `${trainee.athlete.givenName} ${
                  trainee.athlete.familyName || ""
                }`
              : trainee.athlete.name}
          </h3>
          <p className="truncate text-sm text-zinc-400">{trainee.athlete.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-y border-white/10 bg-zinc-950/70 px-5 py-4 md:grid-cols-4 md:px-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 text-center"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              {metric.label}
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-100">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 bg-zinc-950/70 px-5 py-4 md:px-6">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          onClick={() => router.push(`/app/coach/${trainee.id}/planner`)}
        >
          <DumbbellIcon className="h-4 w-4" />
          Plan workouts
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={cancel.isPending}
          onClick={() => cancel.mutateAsync()}
        >
          <XIcon className="h-4 w-4" />
          Cancel relationship
        </button>
      </div>
    </article>
  );
}
