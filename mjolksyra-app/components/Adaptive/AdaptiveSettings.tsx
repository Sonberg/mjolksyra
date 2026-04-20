"use client";

import { useState } from "react";
import { updateTrainingProfile } from "@/services/adaptive/updateTrainingProfile";
import type { ExperienceLevel, IntensityMethod, RepStyle } from "@/services/adaptive/updateTrainingProfile";

type Props = {
  accessToken: string;
};

const GOAL_OPTIONS = [
  "First competition",
  "Increase total",
  "Build muscle",
  "Improve technique",
  "Stay healthy",
  "Break a personal record",
];

export function AdaptiveSettings({ accessToken }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [experience, setExperience] = useState<ExperienceLevel>("Intermediate");
  const [intensity, setIntensity] = useState<IntensityMethod>("Weight");
  const [repStyle, setRepStyle] = useState<RepStyle>("Regular");
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(3);
  const [goals, setGoals] = useState<string[]>([]);
  const [competitionDate, setCompetitionDate] = useState("");
  const [notes, setNotes] = useState("");

  function toggleGoal(goal: string) {
    setGoals((g) => g.includes(goal) ? g.filter((x) => x !== goal) : [...g, goal]);
  }

  async function save() {
    setLoading(true);
    try {
      await updateTrainingProfile({
        accessToken,
        profile: {
          experienceLevel: experience,
          intensityMethod: intensity,
          preferredRepStyle: repStyle,
          workoutsPerWeek,
          goalSport: "Powerlifting",
          goals,
          competitionDate: competitionDate || undefined,
          coachNotes: notes || undefined,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-8 py-16 max-w-2xl mx-auto">
      <div className="flex flex-col gap-12">

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Settings</p>
          <h1 className="text-3xl font-semibold tracking-tight">Training profile</h1>
          <p className="text-[#6b7280] text-sm">Your AI coach reads these to build every program.</p>
        </div>

        <div className="flex flex-col gap-8 divide-y divide-[#f0f0f0]">

          <div className="flex flex-col gap-4 pt-4 first:pt-0">
            <p className="text-sm font-semibold text-[#0a0a0a]">Experience level</p>
            <div className="flex gap-2">
              {(["Beginner", "Intermediate", "Advanced"] as ExperienceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setExperience(lvl)}
                  className={`px-4 py-2 text-sm border transition-colors ${experience === lvl ? "border-[#0a0a0a] bg-[#0a0a0a] text-white" : "border-[#e5e7eb] text-[#0a0a0a] hover:border-[#0a0a0a]"}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8">
            <p className="text-sm font-semibold text-[#0a0a0a]">Intensity method</p>
            <div className="flex gap-2">
              {(["Weight", "Rpe", "Rir"] as IntensityMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setIntensity(m)}
                  className={`px-4 py-2 text-sm border transition-colors ${intensity === m ? "border-[#0a0a0a] bg-[#0a0a0a] text-white" : "border-[#e5e7eb] text-[#0a0a0a] hover:border-[#0a0a0a]"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8">
            <p className="text-sm font-semibold text-[#0a0a0a]">Rep style</p>
            <div className="flex gap-2">
              {(["Regular", "Paused", "Eccentric", "Mixed"] as RepStyle[]).map((rs) => (
                <button
                  key={rs}
                  onClick={() => setRepStyle(rs)}
                  className={`px-4 py-2 text-sm border transition-colors ${repStyle === rs ? "border-[#0a0a0a] bg-[#0a0a0a] text-white" : "border-[#e5e7eb] text-[#0a0a0a] hover:border-[#0a0a0a]"}`}
                >
                  {rs}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8">
            <p className="text-sm font-semibold text-[#0a0a0a]">Workouts per week</p>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setWorkoutsPerWeek(n)}
                  className={`w-10 h-10 text-sm font-medium border transition-colors ${workoutsPerWeek === n ? "border-[#0a0a0a] bg-[#0a0a0a] text-white" : "border-[#e5e7eb] text-[#0a0a0a] hover:border-[#0a0a0a]"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8">
            <p className="text-sm font-semibold text-[#0a0a0a]">Goals</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`px-3 py-1.5 text-sm border transition-colors ${goals.includes(goal) ? "border-[#0a0a0a] bg-[#0a0a0a] text-white" : "border-[#e5e7eb] text-[#0a0a0a] hover:border-[#0a0a0a]"}`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8">
            <p className="text-sm font-semibold text-[#0a0a0a]">Competition date <span className="text-[#6b7280] font-normal">(optional)</span></p>
            <input
              type="date"
              value={competitionDate}
              onChange={(e) => setCompetitionDate(e.target.value)}
              className="w-48 px-3 py-2 text-sm border border-[#e5e7eb] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] bg-white"
            />
          </div>

          <div className="flex flex-col gap-4 pt-8">
            <p className="text-sm font-semibold text-[#0a0a0a]">Notes for your AI coach <span className="text-[#6b7280] font-normal">(optional)</span></p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any injuries, preferences, or context your coach should know…"
              rows={4}
              className="px-3 py-2 text-sm border border-[#e5e7eb] text-[#0a0a0a] outline-none focus:border-[#0a0a0a] resize-none bg-white placeholder-[#9ca3af]"
            />
          </div>

        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={save}
            disabled={loading}
            className="px-6 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
          {saved && (
            <p className="text-sm text-[#6b7280]">Saved.</p>
          )}
        </div>

      </div>
    </div>
  );
}
