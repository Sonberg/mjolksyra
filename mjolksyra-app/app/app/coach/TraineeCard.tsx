"use client";

import { Trainee } from "@/services/trainees/type";
import {
  DumbbellIcon,
  WalletIcon,
  BadgeEuroIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useGravatar } from "@/hooks/useGravatar";
import { AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";

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
  const url = useGravatar(trainee.coach.email ?? "", 56);

  return (
    <div className="group relative rounded-xl bg-white/10 border border-gray-800/50 transition-all duration-200 overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12 rounded-full overflow-hidden border border-gray-black">
          <AvatarImage src={url} />
          <AvatarFallback>
            {trainee.athlete.givenName?.[0] || trainee.athlete.name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
            {trainee.athlete.givenName
              ? `${trainee.athlete.givenName} ${
                  trainee.athlete.familyName || ""
                }`
              : trainee.athlete.name}
          </h3>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-400">{trainee.athlete.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8 bg-black py-6 rounded-t-lg">
        <div className="text-md text-gray-500 text-center">
          <div className="text-white font-bold text-md">
            {trainee.nextWorkoutAt
              ? format(new Date(trainee.nextWorkoutAt), "MMM d")
              : "--"}
          </div>
          <div className="text-sm">Next workout at</div>
        </div>

        <div className="text-gray-500 text-center">
          <div className="text-white font-bold text-md">
            {trainee.lastWorkoutAt
              ? format(new Date(trainee.lastWorkoutAt), "MMM d")
              : "--"}
          </div>
          <div className="text-sm">Last workout at</div>
        </div>

        <div className="text-gray-500 text-center">
          <div className="text-white font-bold text-md">
            {trainee.lastWorkoutAt
              ? format(new Date(trainee.lastWorkoutAt), "MMM d")
              : "--"}
          </div>
          <div className="text-sm">Last charged at</div>
        </div>

        <div className="text-gray-500 text-center">
          <div className="text-white font-bold text-md">1000kr</div>
          <div className="text-sm">Price</div>
        </div>
      </div>

      <div className="flex gap-4 bg-black pb-4 px-4 justify-start">
        <button
          className="flex gap-2 bg-white text-black py-2 px-4 items-center justify-center rounded-full hover:opacity-80"
          onClick={() => onPlanWorkout?.(trainee)}
        >
          <DumbbellIcon className="h-4" /> Plan workouts
        </button>
        <button
          className="flex gap-2 bg-white/10 py-2 px-4 items-center justify-center rounded-full hover:opacity-80"
          onClick={() => onPlanWorkout?.(trainee)}
        >
          <BadgeEuroIcon className="h-4" /> Change price
        </button>
        <button
          className="flex gap-2 bg-white/10 py-2 px-4 items-center justify-center rounded-full hover:opacity-80"
          onClick={() => onPlanWorkout?.(trainee)}
        >
          <WalletIcon className="h-4" /> Pay now
        </button>
      </div>

      {/* <div className="flex items-center gap-8">
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
      </div> */}

      {/* <div className="ml-4">
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
      </div> */}
    </div>
  );
}
