"use client";

import { CoachWorkspaceShell } from "../../../CoachWorkspaceShell";
import { PageSectionHeader } from "@/components/Navigation/PageSectionHeader";
import { Switch } from "@/components/ui/switch";
import { useTraineeInsights } from "@/hooks/useTraineeInsights";
import { useRebuildTraineeInsights } from "@/hooks/useRebuildTraineeInsights";
import { useSetTraineeInsightsVisibility } from "@/hooks/useSetTraineeInsightsVisibility";
import {
  InsightsAccordion,
  hasRenderableInsights,
} from "@/components/TraineeInsights/InsightsAccordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getTrainee } from "@/services/trainees/getTrainee";
import { ChevronLeftIcon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  traineeId: string;
};

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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[var(--shell-muted)]"
            onClick={() => router.push("/app/coach/athletes")}
            aria-label="Back to athletes"
          >
            <ChevronLeftIcon data-icon />
          </Button>
        }
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={handleRebuild}
            disabled={rebuild.isPending || insights?.status === "pending"}
          >
            <RefreshCwIcon
              data-icon="inline-start"
              className={cn(
                (rebuild.isPending || insights?.status === "pending") &&
                  "animate-spin",
              )}
            />
            Rebuild
          </Button>
        }
      />

      {rebuildError ? (
        <Alert variant="destructive">
          <AlertTitle>{rebuildError}</AlertTitle>
        </Alert>
      ) : null}

      {insights && hasInsightsContent && insights.status !== "failed" ? (
        <div className="flex items-center justify-between border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--shell-ink)]">
              Visible to athlete
            </p>
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
        <Alert>
          <AlertTitle>Refreshing insights…</AlertTitle>
          <AlertDescription>
            The previous result stays visible until the rebuild finishes.
          </AlertDescription>
        </Alert>
      ) : null}

      {!insights || (insights.status === "pending" && !hasInsightsContent) ? (
        <Alert>
          <AlertTitle>
            {insights?.status === "pending"
              ? "Generating insights…"
              : "No insights yet."}
          </AlertTitle>
          <AlertDescription>
            {insights?.status === "pending"
              ? "This may take a moment. The page will update automatically."
              : "Click Rebuild to generate insights. Requires at least 3 completed workouts and 1 credit."}
          </AlertDescription>
        </Alert>
      ) : insights.status === "failed" ? (
        <Alert variant="destructive">
          <AlertTitle>Insights generation failed. Click Rebuild to try again.</AlertTitle>
        </Alert>
      ) : (
        <div className="space-y-4 pb-8">
          {generatedAt ? (
            <p className="text-xs text-[var(--shell-muted)]">
              Last generated: {generatedAt}
            </p>
          ) : null}
          <InsightsAccordion insights={insights} />
        </div>
      )}
    </CoachWorkspaceShell>
  );
}
