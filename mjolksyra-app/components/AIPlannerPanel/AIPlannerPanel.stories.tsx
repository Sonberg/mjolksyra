"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentType } from "react";
import React from "react";
import { AIPlannerPanel } from "./AIPlannerPanel";

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
  const Decorator = (Story: ComponentType) => (
    <FetchWrapper Story={Story} fetchImpl={fetchImpl} />
  );
  Decorator.displayName = "WithMockedFetchDecorator";
  return Decorator;
}

const clarifyFollowUp: typeof globalThis.fetch = async () =>
  new Response(
    JSON.stringify({
      message: "What start date are you targeting for this program?",
      isReadyToGenerate: false,
      suggestedParams: null,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );

const clarifyReady: typeof globalThis.fetch = async () =>
  new Response(
    JSON.stringify({
      message:
        "I have all the info I need. Ready to generate your 12-week powerlifting program starting April 14.",
      isReadyToGenerate: true,
      suggestedParams: {
        startDate: "2026-04-14",
        numberOfWeeks: 12,
        conflictStrategy: "Skip",
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );

const generateSuccess: typeof globalThis.fetch = async (input) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  if (url.includes("/generate")) {
    return new Response(
      JSON.stringify({
        workoutsCreated: 36,
        summary: "Generated 36 workouts from Apr 14 to Jul 13, 2026.",
        dateFrom: "2026-04-14",
        dateTo: "2026-07-13",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  return clarifyReady(input);
};

const meta = {
  title: "AIPlannerPanel",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel traineeId="trainee-1" onGenerated={async () => {}} />
    </div>
  ),
};

export const AskingFollowUp: Story = {
  decorators: [withMockedFetch(clarifyFollowUp)],
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel traineeId="trainee-1" onGenerated={async () => {}} />
    </div>
  ),
};

export const ReadyToGenerate: Story = {
  decorators: [withMockedFetch(clarifyReady)],
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel traineeId="trainee-1" onGenerated={async () => {}} />
    </div>
  ),
};

export const AfterGeneration: Story = {
  decorators: [withMockedFetch(generateSuccess)],
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel traineeId="trainee-1" onGenerated={async () => {}} />
    </div>
  ),
};
