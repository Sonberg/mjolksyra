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

export const PendingApproval: Story = {
  render: () => (
    <div className="h-[600px] w-[360px] border border-gray-200">
      <AIPlannerPanel
        traineeId="trainee-1"
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-1",
          description: "Plan the next two weeks after the meet.",
          messages: [
            { role: "user", content: "Move Friday to Saturday for the next two weeks and swap bench for close-grip bench." },
            {
              role: "assistant",
              content:
                "I staged the requested changes as one proposal. Review the summary below and approve when you are ready.",
            },
          ],
          attachedFiles: [
            { name: "meet-notes.csv", type: "text/csv", content: "date,load\n2026-04-01,heavy" },
          ],
          proposedActionSet: {
            id: "proposal-1",
            status: "pending",
            summary: "Move two Friday workouts to Saturday and replace bench press with close-grip bench.",
            explanation: "This keeps the training week intact while shifting the bench focus after the meet.",
            affectedDateFrom: "2026-04-13",
            affectedDateTo: "2026-04-26",
            createdAt: "2026-04-07T10:00:00.000Z",
            actions: [
              {
                actionType: "move_workout",
                summary: "Move Fri Apr 17 workout to Sat Apr 18.",
                targetWorkoutId: "workout-1",
                previousDate: "2026-04-17",
                targetDate: "2026-04-18",
                workout: {
                  name: "Heavy lower",
                  plannedAt: "2026-04-18",
                  exercises: [],
                },
              },
              {
                actionType: "update_exercise",
                summary: "Replace bench press with close-grip bench on Mon Apr 20.",
                targetWorkoutId: "workout-2",
                targetDate: "2026-04-20",
                workout: {
                  name: "Upper volume",
                  plannedAt: "2026-04-20",
                  exercises: [
                    {
                      name: "Close-Grip Bench Press",
                      sets: [{ reps: 6, weightKg: 92.5 }],
                    },
                  ],
                },
              },
            ],
          },
          previewWorkouts: [
            {
              plannedAt: "2026-04-18",
              name: "Heavy lower",
              exercises: [
                { name: "Back Squat", sets: [{ reps: 4, weightKg: 180 }] },
                { name: "Romanian Deadlift", sets: [{ reps: 6, weightKg: 120 }] },
              ],
            },
            {
              plannedAt: "2026-04-20",
              name: "Upper volume",
              exercises: [
                { name: "Close-Grip Bench Press", sets: [{ reps: 6, weightKg: 92.5 }] },
                { name: "Chest Supported Row", sets: [{ reps: 10, weightKg: 60 }] },
              ],
            },
          ],
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
            sessionId: "session-1",
            proposalId: "proposal-1",
            actionsApplied: 36,
            summary: "Generated and applied 36 planned workouts from Apr 14 to Jul 13, 2026.",
            workoutIds: ["workout-1", "workout-2"],
            generatedAt: "2026-04-06T09:00:00.000Z",
          },
        }}
      />
    </div>
  ),
};
