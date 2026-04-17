import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BlockPlannerPanel } from "./BlockPlannerPanel";

const meta = {
  title: "BlockPlannerPanel",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function StoryFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--app-bg)] p-6">
      <div className="h-[720px] w-[400px] border border-[var(--shell-border)] bg-[var(--shell-surface)]">
        {children}
      </div>
    </div>
  );
}

export const Idle: Story = {
  render: () => (
    <StoryFrame>
      <BlockPlannerPanel
        blockId="block-1"
        numberOfWeeks={12}
        onGenerated={async () => {}}
      />
    </StoryFrame>
  ),
};

export const AskingFollowUp: Story = {
  render: () => (
    <StoryFrame>
      <BlockPlannerPanel
        blockId="block-1"
        numberOfWeeks={12}
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-1",
          messages: [
            { role: "user", content: "Build a 12-week strength block, 3 days per week" },
            {
              role: "assistant",
              content: "What is the primary training goal — maximal strength, hypertrophy, or a blend?",
              options: ["Maximal strength", "Hypertrophy", "Blend"],
            },
          ],
        }}
      />
    </StoryFrame>
  ),
};

export const PendingApproval: Story = {
  render: () => (
    <StoryFrame>
      <BlockPlannerPanel
        blockId="block-1"
        numberOfWeeks={12}
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-1",
          messages: [
            { role: "user", content: "Add a squat session on Monday of week 1." },
            {
              role: "assistant",
              content:
                "I staged the change as one proposal. Review the summary below and approve when ready.",
            },
          ],
          proposedActionSet: {
            id: "proposal-1",
            status: "pending",
            summary: "Add a lower-body strength workout in Week 1 / Mon.",
            explanation:
              "This creates a new workout slot with Back Squat as the primary lift.",
            createdAt: "2026-04-07T10:00:00.000Z",
            creditCost: 1,
            creditBreakdown: [
              { actionType: "create_block_workout", count: 1, unitCost: 0.5, subtotal: 0.5 },
            ],
            actions: [
              {
                actionType: "create_block_workout",
                summary: "Create workout at Week 1 / Mon",
                targetWeek: 1,
                targetDayOfWeek: 1,
                workout: {
                  name: "Lower A",
                  note: null,
                  week: 1,
                  dayOfWeek: 1,
                  exercises: [
                    {
                      name: "Back Squat",
                      sets: [{ reps: 5, weightKg: null }],
                    },
                  ],
                },
              },
            ],
          },
        }}
      />
    </StoryFrame>
  ),
};

export const PendingLargeProposal: Story = {
  render: () => (
    <StoryFrame>
      <BlockPlannerPanel
        blockId="block-1"
        numberOfWeeks={4}
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-2",
          messages: [
            { role: "user", content: "Fill out a full 4-week upper/lower split, 4 days/week." },
            {
              role: "assistant",
              content:
                "I staged 16 workouts across 4 weeks. Review the full plan and approve to apply.",
            },
          ],
          proposedActionSet: {
            id: "proposal-big",
            status: "pending",
            summary: "Generate 4-week upper/lower block (16 workouts).",
            explanation:
              "Upper A + Lower A on Mon/Tue, Upper B + Lower B on Thu/Fri, repeated each week.",
            createdAt: "2026-04-07T10:00:00.000Z",
            creditCost: 5,
            creditBreakdown: [
              { actionType: "create_block_workout", count: 16, unitCost: 0.5, subtotal: 8 },
            ],
            actions: [
              { actionType: "create_block_workout", summary: "Week 1 / Mon — Upper A", targetWeek: 1, targetDayOfWeek: 1 },
              { actionType: "create_block_workout", summary: "Week 1 / Tue — Lower A", targetWeek: 1, targetDayOfWeek: 2 },
              { actionType: "create_block_workout", summary: "Week 1 / Thu — Upper B", targetWeek: 1, targetDayOfWeek: 4 },
              { actionType: "create_block_workout", summary: "Week 1 / Fri — Lower B", targetWeek: 1, targetDayOfWeek: 5 },
              { actionType: "create_block_workout", summary: "Week 2 / Mon — Upper A", targetWeek: 2, targetDayOfWeek: 1 },
              { actionType: "create_block_workout", summary: "Week 2 / Tue — Lower A", targetWeek: 2, targetDayOfWeek: 2 },
            ],
          },
        }}
      />
    </StoryFrame>
  ),
};

export const AfterGeneration: Story = {
  render: () => (
    <StoryFrame>
      <BlockPlannerPanel
        blockId="block-1"
        numberOfWeeks={12}
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-1",
          messages: [
            { role: "user", content: "12-week powerlifting block, 3 days per week" },
            { role: "assistant", content: "I staged 36 workouts. Proposal applied." },
          ],
        }}
      />
    </StoryFrame>
  ),
};
