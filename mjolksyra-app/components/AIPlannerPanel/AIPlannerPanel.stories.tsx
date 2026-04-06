import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AIPlannerPanel } from "./AIPlannerPanel";

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
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel
        traineeId="trainee-1"
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-1",
          description: "12-week powerlifting program, 3 days/week",
          messages: [
            { role: "user", content: "12-week powerlifting program, 3 days/week" },
            { role: "assistant", content: "What start date are you targeting for this program?" },
          ],
        }}
      />
    </div>
  ),
};

export const StartedSession: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel
        traineeId="trainee-1"
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-1",
          description: "Swap out the next block after the meet.",
          messages: [
            { role: "user", content: "Remove all workouts after today." },
            {
              role: "assistant",
              content: "This will remove 42 workouts after today. Are you sure you want to do this?",
              options: ["Yes, remove them"],
            },
          ],
          attachedFiles: [
            { name: "meet-notes.csv", type: "text/csv", content: "date,load\n2026-04-01,heavy" },
          ],
        }}
      />
    </div>
  ),
};

export const ReadyToGenerate: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel
        traineeId="trainee-1"
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-1",
          description: "12-week powerlifting program, 3 days/week",
          messages: [
            { role: "user", content: "12-week powerlifting program, 3 days/week" },
            {
              role: "assistant",
              content:
                "I have all the info I need. Ready to generate your 12-week powerlifting program starting April 14.",
            },
          ],
          suggestedParams: {
            startDate: "2026-04-14",
            numberOfWeeks: 12,
            conflictStrategy: "Skip",
          },
          isReadyToGenerate: true,
        }}
      />
    </div>
  ),
};

export const AfterGeneration: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel
        traineeId="trainee-1"
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-1",
          description: "12-week powerlifting program, 3 days/week",
          generationResult: {
            workoutsCreated: 36,
            summary: "Generated 36 workouts from Apr 14 to Jul 13, 2026.",
            dateFrom: "2026-04-14",
            dateTo: "2026-07-13",
            generatedAt: "2026-04-06T09:00:00.000Z",
          },
        }}
      />
    </div>
  ),
};
