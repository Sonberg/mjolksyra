"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startWithAiCoach } from "@/services/adaptive/startWithAiCoach";
import { updateTrainingProfile, TrainingProfile } from "@/services/adaptive/updateTrainingProfile";
import type { ExperienceLevel, IntensityMethod, RepStyle } from "@/services/adaptive/updateTrainingProfile";

type Props = {
  accessToken: string;
};

type Step = "experience" | "goals" | "frequency" | "intensity" | "done";

const GOAL_OPTIONS = [
  "First competition",
  "Increase total",
  "Build muscle",
  "Improve technique",
  "Stay healthy",
  "Break a personal record",
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "Beginner", label: "Beginner", description: "Less than 1 year of structured training" },
  { value: "Intermediate", label: "Intermediate", description: "1–3 years, familiar with the main lifts" },
  { value: "Advanced", label: "Advanced", description: "3+ years, competing or targeting maximal strength" },
];

const INTENSITY_OPTIONS: { value: IntensityMethod; label: string; description: string }[] = [
  { value: "Weight", label: "Weight", description: "Sets prescribed with exact kg targets" },
  { value: "Rpe", label: "RPE", description: "Rate of perceived exertion (1–10 scale)" },
  { value: "Rir", label: "RIR", description: "Reps in reserve — how many reps you had left" },
];

export function AdaptiveOnboardingFlow({ accessToken }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("experience");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<TrainingProfile>>({
    goalSport: "Powerlifting",
    goals: [],
    workoutsPerWeek: 3,
    preferredRepStyle: "Regular",
  });

  function toggle(goal: string) {
    setProfile((p) => ({
      ...p,
      goals: p.goals?.includes(goal)
        ? p.goals.filter((g) => g !== goal)
        : [...(p.goals ?? []), goal],
    }));
  }

  async function finish() {
    setLoading(true);
    try {
      const { traineeId } = await startWithAiCoach({ accessToken });
      await updateTrainingProfile({
        accessToken,
        profile: {
          experienceLevel: profile.experienceLevel ?? "Beginner",
          intensityMethod: profile.intensityMethod ?? "Weight",
          preferredRepStyle: profile.preferredRepStyle ?? "Regular",
          workoutsPerWeek: profile.workoutsPerWeek ?? 3,
          goalSport: "Powerlifting",
          goals: profile.goals ?? [],
          coachNotes: profile.coachNotes,
        },
      });
      router.push(`/app/adaptive/${traineeId}/coach`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-8 py-6 border-b border-[#f0f0f0]">
        <span className="text-sm font-semibold text-[#0a0a0a]">adaptive.ai</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">

          {step === "experience" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Step 1 of 4</p>
                <h1 className="text-3xl font-semibold tracking-tight">Your experience level</h1>
                <p className="text-[#6b7280]">This shapes how your first program is structured.</p>
              </div>
              <div className="flex flex-col gap-3">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setProfile((p) => ({ ...p, experienceLevel: opt.value }));
                      setStep("goals");
                    }}
                    className={`text-left p-5 border transition-colors ${
                      profile.experienceLevel === opt.value
                        ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                        : "border-[#e5e7eb] hover:border-[#0a0a0a]"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${profile.experienceLevel === opt.value ? "text-white/70" : "text-[#6b7280]"}`}>
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "goals" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Step 2 of 4</p>
                <h1 className="text-3xl font-semibold tracking-tight">What are your goals?</h1>
                <p className="text-[#6b7280]">Select all that apply. Your AI coach will prioritize them.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggle(goal)}
                    className={`px-4 py-2 text-sm border transition-colors ${
                      profile.goals?.includes(goal)
                        ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                        : "border-[#e5e7eb] text-[#0a0a0a] hover:border-[#0a0a0a]"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("experience")}
                  className="text-sm text-[#6b7280] hover:text-[#0a0a0a]"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("frequency")}
                  className="px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "frequency" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Step 3 of 4</p>
                <h1 className="text-3xl font-semibold tracking-tight">How often do you train?</h1>
                <p className="text-[#6b7280]">Workouts per week.</p>
              </div>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setProfile((p) => ({ ...p, workoutsPerWeek: n }))}
                    className={`w-12 h-12 text-sm font-semibold border transition-colors ${
                      profile.workoutsPerWeek === n
                        ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                        : "border-[#e5e7eb] text-[#0a0a0a] hover:border-[#0a0a0a]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("goals")}
                  className="text-sm text-[#6b7280] hover:text-[#0a0a0a]"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("intensity")}
                  className="px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "intensity" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Step 4 of 4</p>
                <h1 className="text-3xl font-semibold tracking-tight">How should intensity be prescribed?</h1>
                <p className="text-[#6b7280]">Your AI coach will use this to write every program.</p>
              </div>
              <div className="flex flex-col gap-3">
                {INTENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile((p) => ({ ...p, intensityMethod: opt.value }))}
                    className={`text-left p-5 border transition-colors ${
                      profile.intensityMethod === opt.value
                        ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                        : "border-[#e5e7eb] hover:border-[#0a0a0a]"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${profile.intensityMethod === opt.value ? "text-white/70" : "text-[#6b7280]"}`}>
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("frequency")}
                  className="text-sm text-[#6b7280] hover:text-[#0a0a0a]"
                >
                  Back
                </button>
                <button
                  onClick={finish}
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                >
                  {loading ? "Setting up..." : "Start training"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
