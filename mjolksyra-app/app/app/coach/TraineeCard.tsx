"use client";

import { Trainee } from "@/services/trainees/type";
import { CalendarIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type TraineeCardProps = {
  trainee: Trainee;
};

export function TraineeCard({ trainee }: TraineeCardProps) {
  return (
    <Link 
      href={`/app/coach/athletes/${trainee.id}`} 
      key={trainee.id}
      className="group relative flex items-center justify-between p-6 rounded-xl bg-gray-950/80 hover:bg-gray-900/80 border border-gray-800/50 hover:border-white/30 hover:shadow-lg hover:shadow-white/5 transition-all duration-200"
    >
      {/* Left Section: Athlete Info */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-white/10 to-stone-500/10 grid place-items-center">
            <span className="text-xl font-semibold text-stone-200">
              {trainee.athlete.givenName?.[0] || trainee.athlete.name[0]}
            </span>
          </div>
          {trainee.nextWorkoutAt && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white/20 border-2 border-black grid place-items-center">
              <CalendarIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
            {trainee.athlete.givenName
              ? `${trainee.athlete.givenName} ${trainee.athlete.familyName || ""}`
              : trainee.athlete.name}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-400">{trainee.athlete.email}</p>
            {trainee.lastWorkoutAt && (
              <span className="text-sm text-gray-500">
                Last active: {format(new Date(trainee.lastWorkoutAt), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Cost & Action */}
      <div className="flex items-center gap-8">
        {trainee.cost && (
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-100">
              ${trainee.cost.total}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-stone-200 border border-white/20">
                ${trainee.cost.coach} coach
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900 text-gray-300 border border-gray-800">
                ${trainee.cost.applicationFee} platform
              </span>
            </div>
          </div>
        )}
        <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
} 