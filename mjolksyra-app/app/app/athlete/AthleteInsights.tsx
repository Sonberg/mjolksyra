"use client";

import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { useTraineeInsights } from "@/hooks/useTraineeInsights";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TraineeInsights } from "@/services/trainees/traineeInsightsSchema";
import { cn } from "@/lib/utils";

type Props = {
  traineeId: string;
};

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

function InsightsContent({ insights }: { insights: TraineeInsights }) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["fatigue-risk", "recommendations"]}
      className="divide-y divide-[var(--shell-border)] border border-[var(--shell-border)]"
    >
      {/* Athlete Profile */}
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

      {/* Fatigue Risk */}
      {insights.fatigueRisk ? (
        <AccordionItem value="fatigue-risk" className="border-0">
          <AccordionTrigger className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shell-ink)] hover:no-underline">
            <span className="flex items-center gap-2">
              Fatigue Risk
              <FatigueRiskBadge level={insights.fatigueRisk.level} />
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-0">
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
            <p className="mt-2 text-sm text-[var(--shell-muted)]">{insights.fatigueRisk.explanation}</p>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {/* Progression Summary */}
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

      {/* Strengths */}
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

      {/* Weaknesses */}
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

      {/* Recommendations */}
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

export function AthleteInsights({ traineeId }: Props) {
  const { data: insights } = useTraineeInsights(traineeId);

  const generatedAt = insights?.generatedAt
    ? new Date(insights.generatedAt).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8 pb-8">
      <PageSectionHeader
        eyebrow="Intelligence"
        title="Your Insights"
        titleClassName="text-xl md:text-2xl"
        description={generatedAt ? `Last updated ${generatedAt}` : "Insights are generated by your coach."}
      />

      {!insights || insights.status === "pending" ? (
        <div className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-6 text-center">
          <p className="text-sm font-semibold text-[var(--shell-ink)]">
            {insights?.status === "pending" ? "Generating insights…" : "No insights available yet."}
          </p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">
            {insights?.status === "pending"
              ? "This may take a moment. The page will update automatically."
              : "Your coach will generate insights once you have completed enough workouts."}
          </p>
        </div>
      ) : insights.status === "failed" ? (
        <div className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-6 text-center">
          <p className="text-sm font-semibold text-[var(--shell-ink)]">Insights generation failed.</p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Your coach can retry from the coach portal.</p>
        </div>
      ) : !insights.visibleToAthlete ? (
        <div className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] p-6 text-center">
          <p className="text-sm font-semibold text-[var(--shell-ink)]">Insights are not yet shared.</p>
          <p className="mt-1 text-xs text-[var(--shell-muted)]">Your coach will make your insights visible when ready.</p>
        </div>
      ) : (
        <InsightsContent insights={insights} />
      )}
    </div>
  );
}
