"use client";

import { CoachCard } from "./CoachCard";
import { User } from "@/services/users/type";
import { CoachOnboarding } from "./CoachOnboarding";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon, UserPlusIcon } from "lucide-react";
import { format } from "date-fns";
import { Trainee } from "@/services/trainees/type";

type Props = { trainees: Trainee[]; user: User };

export function PageContent({ trainees, user }: Props) {
  const canInvite = user.onboarding.coach === "Completed";

  return (
    <div className="space-y-8">
      <CoachOnboarding user={user} />

      {/* Athletes Section */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Athletes</h2>
            <p className="text-sm text-gray-500 mt-1">
              {trainees.length} {trainees.length === 1 ? "athlete" : "athletes"}{" "}
              in total
            </p>
          </div>
          <Button
            disabled={!canInvite}
            className="flex items-center gap-2 px-4 py-2 font-semibold"
            size="lg"
          >
            <UserPlusIcon className="w-5 h-5" />
            Invite Athlete
          </Button>
        </div>

        {trainees.length > 0 ? (
          <div className="grid gap-4">
            {trainees.map((trainee) => (
              <div
                key={trainee.id}
                className="flex items-center justify-between p-6 rounded-lg border border-gray-100 bg-white/80 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 grid place-items-center">
                    <span className="text-lg font-semibold text-purple-700">
                      {trainee.athlete.givenName?.[0] ||
                        trainee.athlete.name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {trainee.athlete.givenName
                        ? `${trainee.athlete.givenName} ${
                            trainee.athlete.familyName || ""
                          }`
                        : trainee.athlete.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {trainee.athlete.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  {/* Workout Status */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {trainee.lastWorkoutAt ? (
                        <>
                          Last workout:{" "}
                          {format(new Date(trainee.lastWorkoutAt), "MMM d")}
                        </>
                      ) : (
                        "No workouts yet"
                      )}
                    </div>
                    {trainee.nextWorkoutAt && (
                      <div className="flex items-center gap-1 text-sm text-purple-600 mt-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          Next:{" "}
                          {format(new Date(trainee.nextWorkoutAt), "MMM d")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price Info */}
                  {trainee.cost && (
                    <div className="min-w-24 text-right">
                      <div className="font-medium text-gray-900">
                        ${trainee.cost.total}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <UserPlusIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Athletes Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {canInvite
                ? "Start growing your coaching business by inviting your first athlete."
                : "Complete your onboarding to start inviting athletes and grow your coaching business."}
            </p>
            <Button disabled={!canInvite} size="lg" className="font-semibold">
              <PlusIcon className="w-5 h-5" />
              Invite Your First Athlete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
