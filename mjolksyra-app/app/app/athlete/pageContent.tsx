"use client";

import { User } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { AthleteWorkouts } from "./AthleteWorkouts";
import { AthleteInvitations } from "./AthleteInvitations";
import {
  DumbbellIcon,
  UserCircle2Icon,
  CalendarIcon,
  TrendingUpIcon,
} from "lucide-react";

type Props = {
  user: User;
};

export function PageContent({ user }: Props) {
  const needsOnboarding = user.onboarding.athlete !== "Completed";

  return (
    <div className="py-8 space-y-8">
      {needsOnboarding ? (
        <AthleteOnboardingFlow />
      ) : (
        <>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent">
              Welcome Back, {user.givenName || "Athlete"}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Track your progress and manage your workouts
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Coaches & Invitations */}
            <div className="lg:col-span-1">
              {/* Combined Coaches & Invitations Section */}
              <section className="rounded-xl border border-gray-800/50 bg-gray-950/50 p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-100">
                    Your Coaches
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Manage your coaching relationships
                  </p>
                </div>

                {/* Active Coaches */}
                {user.coaches?.length > 0 && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">
                      Active
                    </h3>
                    {user.coaches.map((coach) => (
                      <div
                        key={coach.traineeId}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-950/80 border border-gray-800/50 hover:border-white/30 transition-colors"
                      >
                        <div className="h-12 w-12 rounded-full bg-white/10 grid place-items-center">
                          <UserCircle2Icon className="w-6 h-6 text-stone-200" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-100">
                            {coach.givenName} {coach.familyName}
                          </h3>
                          <p className="text-sm text-gray-400">Active Coach</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending Invitations */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Pending Invitations
                  </h3>
                  <div className="bg-gray-950/80 rounded-lg p-4">
                    <AthleteInvitations />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Workouts & Stats */}
            <div className="lg:col-span-2 space-y-8">
              {/* Workouts Section */}
              <section className="rounded-xl border border-gray-800/50 bg-gray-950/50 p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-100">
                    Your Workouts
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    View and track your workout progress
                  </p>
                </div>
                <div className="bg-gray-950/80 rounded-lg p-4">
                  <AthleteWorkouts />
                </div>
              </section>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Weekly Progress", icon: TrendingUpIcon },
                  { name: "Active Programs", icon: DumbbellIcon },
                  { name: "Next Session", icon: CalendarIcon },
                ].map((stat) => (
                  <div
                    key={stat.name}
                    className="p-6 rounded-xl border border-gray-800/50 bg-gray-950/80 hover:bg-gray-900/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/10 grid place-items-center">
                        <stat.icon className="w-5 h-5 text-stone-200" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">
                          {stat.name}
                        </h3>
                        <p className="text-lg font-semibold text-gray-100">
                          --
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
