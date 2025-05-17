"use client";

import { Trainee } from "@/services/trainees/type";
import {
  CalendarIcon,
  MoreVerticalIcon,
  DumbbellIcon,
  DollarSignIcon,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type TraineeCardProps = {
  trainee: Trainee;
  onPlanWorkout?: (trainee: Trainee) => void;
  onManageCost?: (trainee: Trainee) => void;
  onCancel?: (trainee: Trainee) => void;
};

export function TraineeCard({
  trainee,
  onPlanWorkout,
  onManageCost,
  onCancel,
}: TraineeCardProps) {
  return (
    <div className="group relative flex items-center justify-between p-6 rounded-xl bg-gray-950/80 hover:bg-gray-900/80 border border-gray-800/50 hover:border-white/30 hover:shadow-lg hover:shadow-white/5 transition-all duration-200">
      <div className="flex-1 flex items-center justify-between">
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
                ? `${trainee.athlete.givenName} ${
                    trainee.athlete.familyName || ""
                  }`
                : trainee.athlete.name}
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-gray-400">{trainee.athlete.email}</p>
              {trainee.lastWorkoutAt && (
                <span className="text-sm text-gray-500">
                  Last active:{" "}
                  {format(new Date(trainee.lastWorkoutAt), "MMM d")}
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
        </div>
      </div>
      {/* Actions Dropdown */}
      <div className="ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onPlanWorkout?.(trainee)}
              className="cursor-pointer text-white hover:text-white focus:text-white"
            >
              <DumbbellIcon className="mr-2 h-4 w-4" />
              Plan Workout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onManageCost?.(trainee)}
              className="cursor-pointer text-white hover:text-white focus:text-white"
            >
              <DollarSignIcon className="mr-2 h-4 w-4" />
              Manage Cost
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onCancel?.(trainee)}
              className="cursor-pointer text-red-500 hover:text-red-400 focus:text-red-400"
            >
              <XIcon className="mr-2 h-4 w-4" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
