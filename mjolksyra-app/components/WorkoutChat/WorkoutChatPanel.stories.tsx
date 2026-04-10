"use client"

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { ComponentType } from "react"
import React from "react"
import { WorkoutChatPanel } from "./WorkoutChatPanel"

type FetchWrapperProps = {
  Story: ComponentType
  fetchImpl: typeof globalThis.fetch
}

function FetchWrapper({ Story, fetchImpl }: FetchWrapperProps) {
  React.useEffect(() => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchImpl
    return () => {
      globalThis.fetch = originalFetch
    }
  }, [fetchImpl])

  return <Story />
}

function withMockedFetch(fetchImpl: typeof globalThis.fetch) {
  const Decorator = (Story: ComponentType) => {
    return <FetchWrapper Story={Story} fetchImpl={fetchImpl} />
  }
  Decorator.displayName = "WithMockedFetchDecorator"
  return Decorator
}

function getInputUrl(input: Parameters<typeof globalThis.fetch>[0]) {
  if (typeof input === "string") {
    return input
  }

  if (input instanceof URL) {
    return input.toString()
  }

  return input.url
}

const mockEmptyChatFetch: typeof globalThis.fetch = async (input) => {
  const url = getInputUrl(input)
  if (url.includes("/chat-messages")) {
    return new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ data: [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

const mockConversationFetch: typeof globalThis.fetch = async (input) => {
  const url = getInputUrl(input)
  if (url.includes("/chat-messages")) {
    return new Response(
      JSON.stringify({
        data: [
          {
            id: "m-1",
            userId: "coach-1",
            role: "Coach",
            message: "Solid effort today. How did set 3 feel?",
            media: [],
            createdAt: "2026-04-03T08:10:00.000Z",
            modifiedAt: "2026-04-03T08:10:00.000Z",
          },
          {
            id: "m-2",
            userId: "athlete-1",
            role: "Athlete",
            message: "Pretty hard, but I kept depth on all reps.",
            media: [],
            createdAt: "2026-04-03T08:13:00.000Z",
            modifiedAt: "2026-04-03T08:13:00.000Z",
          },
          {
            id: "m-3",
            userId: "coach-1",
            role: "Coach",
            message: "Perfect. Keep the same load next week and add one rep on the final set.",
            media: [],
            createdAt: "2026-04-03T08:16:00.000Z",
            modifiedAt: "2026-04-03T08:16:00.000Z",
          },
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  return new Response(JSON.stringify({ data: [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

const meta = {
  title: "WorkoutChat/WorkoutChatPanel",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AthleteView: Story = {
  decorators: [withMockedFetch(mockEmptyChatFetch)],
  render: () => (
    <WorkoutChatPanel
      traineeId="trainee-1"
      completedWorkoutId="workout-1"
      viewerMode="athlete"
    />
  ),
}

export const CoachView: Story = {
  decorators: [withMockedFetch(mockEmptyChatFetch)],
  render: () => (
    <WorkoutChatPanel
      traineeId="trainee-1"
      completedWorkoutId="workout-1"
      viewerMode="coach"
    />
  ),
}

export const WithConversation: Story = {
  decorators: [withMockedFetch(mockConversationFetch)],
  render: () => (
    <WorkoutChatPanel
      traineeId="trainee-1"
      completedWorkoutId="workout-1"
      viewerMode="athlete"
    />
  ),
}

export const ReadyForAnalysis: Story = {
  decorators: [withMockedFetch(mockConversationFetch)],
  render: () => (
    <WorkoutChatPanel
      traineeId="trainee-1"
      completedWorkoutId="workout-1"
      viewerMode="coach"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Use this together with the workout analysis section to keep AI outcome and chat separate.",
      },
    },
  },
}
