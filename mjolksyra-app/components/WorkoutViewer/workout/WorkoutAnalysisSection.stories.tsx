"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import React from "react";
import { WorkoutAnalysisSection } from "./WorkoutAnalysisSection";

type FetchWrapperProps = {
  Story: ComponentType;
  fetchImpl: typeof globalThis.fetch;
};

function FetchWrapper({ Story, fetchImpl }: FetchWrapperProps) {
  React.useEffect(() => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchImpl;
    return () => {
      globalThis.fetch = originalFetch;
    };
  }, [fetchImpl]);

  return <Story />;
}

function withMockedFetch(fetchImpl: typeof globalThis.fetch) {
  const Decorator = (Story: ComponentType) => {
    return <FetchWrapper Story={Story} fetchImpl={fetchImpl} />;
  };

  Decorator.displayName = "WithMockedFetchDecorator";
  return Decorator;
}

const mockAnalysisFetch: typeof globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method ?? "GET";

  if (url.includes("/analysis/latest") && method === "GET") {
    return new Response(
      JSON.stringify({
        summary: "Previous review: stable movement pattern.",
        keyFindings: ["Balanced tempo across sets"],
        techniqueRisks: ["Hip shift under fatigue"],
        coachSuggestions: ["Cue even pressure through both feet"],
        createdAt: "2026-04-03T08:45:00.000Z",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      summary: "Session quality is solid with stable pacing.",
      keyFindings: ["Consistent squat depth"],
      techniqueRisks: ["Mild valgus on fatigue reps"],
      coachSuggestions: ["Cue knees out through ascent"],
      createdAt: "2026-04-04T09:00:00.000Z",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

const meta = {
  title: "WorkoutViewer/WorkoutAnalysisSection",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoachAnalysis: Story = {
  decorators: [withMockedFetch(mockAnalysisFetch)],
  render: () => (
    <WorkoutAnalysisSection traineeId="trainee-1" plannedWorkoutId="workout-1" />
  ),
};
