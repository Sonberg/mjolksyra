"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSurpriseBlock } from "@/services/adaptive/generateSurpriseBlock";
import { Sparkles, Loader2 } from "lucide-react";

type Props = {
  traineeId: string;
  accessToken: string;
};

export function AiCoachView({ traineeId, accessToken }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSurpriseMe() {
    setLoading(true);
    setError(null);
    try {
      await generateSurpriseBlock({ traineeId, accessToken });
      router.push(`/app/adaptive/${traineeId}/timeline`);
    } catch {
      setError("Something went wrong generating your block. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="px-8 py-16 max-w-2xl mx-auto">
      <div className="flex flex-col gap-12">

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Your AI coach</p>
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            What do you want<br />to work on?
          </h1>
        </div>

        <div className="border border-[#e5e7eb] p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Surprise me</h2>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              Your AI coach reads your training history, goals, and equipment — then builds the optimal
              next block for you. No questions asked.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleSurpriseMe}
            disabled={loading}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#0a0a0a] text-white text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 self-start"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Building your block…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Surprise me
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Or tell your coach</p>
          <p className="text-sm text-[#6b7280]">
            Custom block generation with conversation coming soon.
          </p>
        </div>

      </div>
    </div>
  );
}
