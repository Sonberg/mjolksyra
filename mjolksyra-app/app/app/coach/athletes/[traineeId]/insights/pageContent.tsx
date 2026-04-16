"use client";

import { CoachWorkspaceShell } from "../../../CoachWorkspaceShell";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useTraineeInsights } from "@/hooks/useTraineeInsights";
import { useRebuildTraineeInsights } from "@/hooks/useRebuildTraineeInsights";
import { useSetTraineeInsightsVisibility } from "@/hooks/useSetTraineeInsightsVisibility";
import { TraineeInsights } from "@/services/trainees/traineeInsightsSchema";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  traineeId: string;
};

function hasRenderableInsights(insights: TraineeInsights | null | undefined) {
  if (!insights) return false;

  return Boolean(
    insights.athleteProfile ||
      insights.fatigueRisk ||
      insights.progressionSummary ||
      insights.strengths.length > 0 ||
      insights.weaknesses.length > 0 ||
      insights.recommendations.length > 0,
  );
}

function FatigueRiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  return (
    <span
      className={cn(
        "rounded-none px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        level === "low" && "bg-emerald-900/30 text-emerald-400",
        level === "medium" && "bg-amber-900/30 text-amber-400",
        level === "high" && "bg-red-900/30 text-red-400",
      )}
    >
      {level}
    </span>
  );
}

function TrendBadge({ trend }: { trend: "improving" | "plateauing" | "declining" }) {
  return (
    <span
      className={cn(
        "rounded-none px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        trend === "improving" && "bg-emerald-900/30 text-emerald-400",
        trend === "plateauing" && "bg-amber-900/30 text-amber-400",
        trend === "declining" && "bg-red-900/30 text-red-400",
      )}
    >
      {trend}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  return (
    <span
      className={cn(
        "rounded-none px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        priority === "high" && "bg-red-900/30 text-red-400",
        priority === "medium" && "bg-amber-900/30 text-amber-400",
        priority === "low" && "bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
      )}
    >
      {priority}
    </span>
  );
}

function InsightsAccordion({ insights }: { insights: TraineeInsights }) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["fatigue-risk", "recommendations"]}
      className="divide-y divide-[var(--shell-border)] border border-[var(--shell-border)]"
    >
      {insights.athleteProfile ? (
        <AccordionItem value="athlete-profile" className="border-0">
          <AccordionTrigger className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)] hover:no-underline">
            Athlete Profile
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
            <div className="flex items-start gap-3">
              <span className="shrink-0 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-ink)]">
                {insights.athleteProfile.trainingAge}
              </span>
              <p className="text-sm text-[var(--shell-muted)]">{insights.athleteProfile.summary}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {insights.fatigueRisk ? (
        <AccordionItem value="fatigue-risk" className="border-0">
          <AccordionTrigger className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)] hover:no-underline">
            <span className="flex items-center gap-2">
              Fatigue Risk
              <FatigueRiskBadge level={insights.fatigueRisk.level} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-none bg-[var(--shell-surface-strong)]">
                <div
                  className={cn(
                    "h-full",
                    insights.fatigueRisk.level === "low" && "bg-emerald-500",
                    insights.fatigueRisk.level === "medium" && "bg-amber-500",
                    insights.fatigueRisk.level === "high" && "bg-red-500",
                  )}
                  style={{ width: `${Math.round(insights.fatigueRisk.score * 100)}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-semibold text-[var(--shell-ink)]">
                {Math.round(insights.fatigueRisk.score * 100)}
              </span>
            </div>
            <p className="text-sm text-[var(--shell-muted)]">{insights.fatigueRisk.explanation}</p>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {insights.progressionSummary ? (
        <AccordionItem value="progression" className="border-0">
          <AccordionTrigger className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)] hover:no-underline">
            <span className="flex items-center gap-2">
              Progression
              <TrendBadge trend={insights.progressionSummary.overall} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0 space-y-3">
            <p className="text-sm text-[var(--shell-muted)]">{insights.progressionSummary.summary}</p>
            {insights.progressionSummary.exercises.length > 0 ? (
              <ul className="divide-y divide-[var(--shell-border)]">
                {insights.progressionSummary.exercises.map((ex, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 py-2">
                    <p className="text-sm font-medium text-[var(--shell-ink)]">{ex.name}</p>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <TrendBadge trend={ex.trend} />
                      <p className="text-xs text-[var(--shell-muted)]">{ex.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {insights.strengths.length > 0 ? (
        <AccordionItem value="strengths" className="border-0">
          <AccordionTrigger className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)] hover:no-underline">
            Strengths
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
            <ul className="space-y-3">
              {insights.strengths.map((s, i) => (
                <li key={i} className="border-l-2 border-emerald-500 pl-3">
                  <p className="text-sm font-semibold text-[var(--shell-ink)]">{s.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--shell-muted)]">{s.detail}</p>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {insights.weaknesses.length > 0 ? (
        <AccordionItem value="weaknesses" className="border-0">
          <AccordionTrigger className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)] hover:no-underline">
            Areas to Improve
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
            <ul className="space-y-3">
              {insights.weaknesses.map((w, i) => (
                <li key={i} className="border-l-2 border-amber-500 pl-3">
                  <p className="text-sm font-semibold text-[var(--shell-ink)]">{w.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--shell-muted)]">{w.detail}</p>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {insights.recommendations.length > 0 ? (
        <AccordionItem value="recommendations" className="border-0">
          <AccordionTrigger className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)] hover:no-underline">
            Recommendations
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
            <ul className="space-y-3">
              {insights.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <PriorityBadge priority={r.priority} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--shell-ink)]">{r.label}</p>
                    <p className="mt-0.5 text-xs text-[var(--shell-muted)]">{r.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ) : null}
    </Accordion>
  );
}

export function PageContent({ traineeId }: Props) {
  const router = useRouter();
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [rebuildError, setRebuildError] = useState<string | null>(null);

  const { data: trainee } = useQuery({
    queryKey: ["trainees", traineeId, "insightsHeader"],
    queryFn: ({ signal }) => getTrainee({ id: traineeId, signal }),
  });

  const { data: insights } = useTraineeInsights(traineeId);
  const rebuild = useRebuildTraineeInsights(traineeId);
  const setVisibility = useSetTraineeInsightsVisibility(traineeId);
  const hasInsightsContent = hasRenderableInsights(insights);
  const showPendingRefreshNotice =
    insights?.status === "pending" && hasInsightsContent;

  const athleteName =
    trainee?.athlete?.givenName || trainee?.athlete?.familyName
      ? `${trainee?.athlete?.givenName ?? ""} ${trainee?.athlete?.familyName ?? ""}`.trim()
      : trainee?.athlete?.name || "Athlete";

  const generatedAt = insights?.generatedAt
    ? new Date(insights.generatedAt).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  async function handleRebuild() {
    setRebuildError(null);
    const result = await rebuild.mutateAsync();
    if (!result.ok) {
      const messages: Record<number, string> = {
        402: "Not enough credits to rebuild insights.",
        409: "Insights are already being generated.",
        422: "At least 3 completed workouts are required.",
        403: "You do not have access to this athlete.",
      };
      setRebuildError(messages[result.status] ?? result.message);
    }
  }

  async function handleVisibilityToggle(checked: boolean) {
    setIsTogglingVisibility(true);
    try {
      await setVisibility.mutateAsync(checked);
    } finally {
      setIsTogglingVisibility(false);
    }
  }

  return (
    <CoachWorkspaceShell>
      <PageSectionHeader
        eyebrow="Insights"
        title={athleteName}
        titleClassName="text-xl md:text-2xl"
        leading={
          <button
            type="button"
            className="inline-flex items-center text-[var(--shell-muted)] transition hover:text-[var(--shell-ink)]"
            onClick={() => router.push("/app/coach/athletes")}
            aria-label="Back to athletes"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        }
        actions={
          <button
            type="button"
            onClick={handleRebuild}
            disabled={rebuild.isPending || insights?.status === "pending"}
            className="inline-flex items-center gap-2 rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCwIcon
              className={cn("h-4 w-4", (rebuild.isPending || insights?.status === "pending") && "animate-spin")}
            />
            Rebuild
          </button>
        }
      />

      {/* Rebuild error */}
      {rebuildError ? (
        <div className="border border-red-500 bg-red-50 px-4 py-3 dark:bg-red-950">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{rebuildError}</p>
        </div>
      ) : null}

      {/* Visibility toggle */}
      {insights && hasInsightsContent && insights.status !== "failed" ? (
        <div className="flex items-center justify-between border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--shell-ink)]">Visible to athlete</p>
            <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
              Allow the athlete to see their insights in their portal.
            </p>
          </div>
          <Switch
            checked={insights.visibleToAthlete}
            onCheckedChange={handleVisibilityToggle}
            disabled={isTogglingVisibility || insights.status === "pending"}
          />
        </div>
      ) : null}

      {showPendingRefreshNotice ? (
        <div className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-4">
          <p className="text-sm font-semibold text-[var(--shell-ink)]">
            Refreshing insights…
          </p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">
            The previous result stays visible until the rebuild finishes.
          </p>
        </div>
      ) : null}

      {/* Status or content */}
      {!insights || (insights.status === "pending" && !hasInsightsContent) ? (
        <div className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-6 text-center">
          <p className="text-sm font-semibold text-[var(--shell-ink)]">
            {insights?.status === "pending" ? "Generating insights…" : "No insights yet."}
          </p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">
            {insights?.status === "pending"
              ? "This may take a moment. The page will update automatically."
              : "Click Rebuild to generate insights. Requires at least 3 completed workouts and 1 credit."}
          </p>
        </div>
      ) : insights.status === "failed" ? (
        <div className="border border-red-500 bg-red-50 p-4 dark:bg-red-950">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Insights generation failed. Click Rebuild to try again.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {generatedAt ? (
            <p className="text-xs text-[var(--shell-muted)]">Last generated: {generatedAt}</p>
          ) : null}
          <InsightsAccordion insights={insights} />
        </div>
      )}
    </CoachWorkspaceShell>
  );
}
