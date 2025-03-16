"use client";

import { CoachCard } from "./CoachCard";
import { User } from "@/services/users/type";
import { CoachOnboarding } from "./CoachOnboarding";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronRightIcon, PlusIcon, UserPlusIcon } from "lucide-react";
import { format } from "date-fns";
import { Trainee } from "@/services/trainees/type";
import Link from "next/link";

type Props = { trainees: Trainee[]; user: User };

export function PageContent({ trainees, user }: Props) {
  const canInvite = user.onboarding.coach === "Completed";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <CoachOnboarding user={user} />

        {/* Athletes Section */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Athletes
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Manage your {trainees.length} {trainees.length === 1 ? "athlete" : "athletes"}
              </p>
            </div>
            <Button
              disabled={!canInvite}
              className="flex items-center gap-2 px-6 py-2 font-semibold shadow-sm bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              <UserPlusIcon className="w-5 h-5" />
              Invite Athlete
            </Button>
          </div>

          {trainees.length > 0 ? (
            <div className="grid gap-4">
              {trainees.map((trainee) => (
                <Link 
                  href={`/app/coach/athletes/${trainee.id}`} 
                  key={trainee.id}
                  className="group relative flex items-center justify-between p-6 rounded-xl bg-gray-900/70 hover:bg-gray-900/90 border border-gray-800 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
                >
                  {/* Left Section: Athlete Info */}
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 grid place-items-center">
                        <span className="text-xl font-semibold text-purple-400">
                          {trainee.athlete.givenName?.[0] || trainee.athlete.name[0]}
                        </span>
                      </div>
                      {trainee.nextWorkoutAt && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-purple-500 border-2 border-gray-900 grid place-items-center">
                          <CalendarIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 group-hover:text-purple-400 transition-colors">
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
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
                            ${trainee.cost.coach} coach
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                            ${trainee.cost.applicationFee} platform
                          </span>
                        </div>
                      </div>
                    )}
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-800 bg-gray-900/30">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 mb-6">
                <UserPlusIcon className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">
                No Athletes Yet
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {canInvite
                  ? "Ready to expand your coaching impact? Start by inviting your first athlete and begin your journey as a professional coach."
                  : "Complete your onboarding to unlock athlete invitations and start your coaching journey."}
              </p>
              <Button 
                disabled={!canInvite} 
                size="lg" 
                className="font-semibold px-8 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <PlusIcon className="w-5 h-5" />
                Invite Your First Athlete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
