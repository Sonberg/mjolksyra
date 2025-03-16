"use client";

import { User } from "@/services/users/type";
import { AthleteOnboardingFlow } from "@/components/AthleteOnboardingFlow/AthleteOnboardingFlow";
import { AthleteWorkouts } from "./AthleteWorkouts";
import { AthleteInvitations } from "./AthleteInvitations";
import { DumbbellIcon } from "lucide-react";

type Props = {
  user: User;
};

export function PageContent({ user }: Props) {
  const needsOnboarding = user.onboarding.athlete !== "Completed" && false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {needsOnboarding ? (
          <AthleteOnboardingFlow />
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Welcome Back, {user.givenName || 'Athlete'}
              </h1>
              <p className="text-sm text-gray-400 mt-2">
                Track your progress and manage your workouts
              </p>
            </div>

            {/* Main Content */}
            <div className="grid gap-8">
              {/* Invitations Section */}
              <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-100">
                    Pending Invitations
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Review and accept coach invitations
                  </p>
                </div>
                <div className="bg-gray-900/30 rounded-lg p-4">
                  <AthleteInvitations />
                </div>
              </section>

              {/* Workouts Section */}
              <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-100">
                    Your Workouts
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    View and track your workout progress
                  </p>
                </div>
                <div className="bg-gray-900/30 rounded-lg p-4">
                  <AthleteWorkouts />
                </div>
              </section>
            </div>

            {/* Quick Stats or Featured Content */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Weekly Progress', 'Active Programs', 'Next Session'].map((stat) => (
                <div
                  key={stat}
                  className="p-6 rounded-xl border border-gray-800 bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/20 grid place-items-center">
                      <DumbbellIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">{stat}</h3>
                      <p className="text-lg font-semibold text-gray-100">--</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
