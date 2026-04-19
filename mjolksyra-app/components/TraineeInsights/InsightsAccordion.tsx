import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TraineeInsights } from "@/services/trainees/traineeInsightsSchema";
import { cn } from "@/lib/utils";

export function hasRenderableInsights(
  insights: TraineeInsights | null | undefined,
): boolean {
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

export function FatigueRiskBadge({
  level,
}: {
  level: "low" | "medium" | "high";
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-none px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em]",
        level === "low" &&
          "border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
        level === "medium" &&
          "border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        level === "high" &&
          "border-transparent bg-[var(--shell-ink)] text-[var(--shell-surface)]",
      )}
    >
      {level}
    </Badge>
  );
}

export function TrendBadge({
  trend,
}: {
  trend: "improving" | "plateauing" | "declining";
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-none px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em]",
        trend === "improving" &&
          "border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
        trend === "plateauing" &&
          "border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        trend === "declining" &&
          "border-transparent bg-[var(--shell-ink)] text-[var(--shell-surface)]",
      )}
    >
      {trend}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: "high" | "medium" | "low";
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-none px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em]",
        priority === "high" &&
          "border-transparent bg-[var(--shell-ink)] text-[var(--shell-surface)]",
        priority === "medium" &&
          "border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        priority === "low" &&
          "border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-muted)]",
      )}
    >
      {priority}
    </Badge>
  );
}

export function InsightsAccordion({ insights }: { insights: TraineeInsights }) {
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
              <p className="text-sm text-[var(--shell-muted)]">
                {insights.athleteProfile.summary}
              </p>
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
          <AccordionContent className="px-4 pb-4 pt-0 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-none bg-[var(--shell-surface-strong)]">
                <div
                  className="h-full bg-[var(--shell-ink)]"
                  style={{
                    width: `${Math.min(Math.round(insights.fatigueRisk.score), 100)}%`,
                  }}
                />
              </div>
              <span className="shrink-0 text-xs font-semibold text-[var(--shell-ink)]">
                {Math.round(insights.fatigueRisk.score)}
              </span>
            </div>
            <p className="text-sm text-[var(--shell-muted)]">
              {insights.fatigueRisk.explanation}
            </p>
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
          <AccordionContent className="px-4 pb-4 pt-0 flex flex-col gap-3">
            <p className="text-sm text-[var(--shell-muted)]">
              {insights.progressionSummary.summary}
            </p>
            {insights.progressionSummary.exercises.length > 0 ? (
              <ul className="divide-y divide-[var(--shell-border)]">
                {insights.progressionSummary.exercises.map((ex, i) => (
                  <li key={i} className="flex flex-col gap-1 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--shell-ink)]">
                        {ex.name}
                      </p>
                      <TrendBadge trend={ex.trend} />
                    </div>
                    <p className="text-xs text-[var(--shell-muted)]">
                      {ex.detail}
                    </p>
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
            <ul className="divide-y divide-[var(--shell-border)]">
              {insights.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 py-2 first:pt-0">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--shell-ink)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--shell-ink)]">
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
                      {s.detail}
                    </p>
                  </div>
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
            <ul className="divide-y divide-[var(--shell-border)]">
              {insights.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3 py-2 first:pt-0">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--shell-muted)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--shell-ink)]">
                      {w.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
                      {w.detail}
                    </p>
                  </div>
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
            <ul className="flex flex-col gap-3">
              {insights.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <PriorityBadge priority={r.priority} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--shell-ink)]">
                      {r.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--shell-muted)]">
                      {r.detail}
                    </p>
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
