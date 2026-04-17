import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TraineePlannerPanel } from "./TraineePlannerPanel";

const meta = {
  title: "TraineePlannerPanel",
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
      <TraineePlannerPanel traineeId="trainee-1" onGenerated={async () => {}} />
    </StoryFrame>
  ),
};

export const AskingFollowUp: Story = {
  render: () => (
    <StoryFrame>
      <TraineePlannerPanel
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
    </StoryFrame>
  ),
};

export const PendingApproval: Story = {
  render: () => (
    <StoryFrame>
      <TraineePlannerPanel
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
            creditCost: 1,
            creditBreakdown: [
              { actionType: "move_workout", count: 1, unitCost: 0.5, subtotal: 0.5 },
              { actionType: "update_exercise", count: 1, unitCost: 0.25, subtotal: 0.25 },
            ],
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
    </StoryFrame>
  ),
};

export const PendingMidCostProposal: Story = {
  render: () => (
    <StoryFrame>
      <TraineePlannerPanel
        traineeId="trainee-1"
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-3",
          description: "Reshape the next two weeks after travel.",
          messages: [
            { role: "user", content: "Move two sessions, rebuild one workout, and adjust accessories." },
            {
              role: "assistant",
              content: "I staged a broader update proposal. Review the plan and price before approving.",
            },
          ],
          proposedActionSet: {
            id: "proposal-mid",
            status: "pending",
            summary: "Reshape three upcoming workouts after travel.",
            explanation: "This keeps the weekly rhythm but smooths the return to heavier work.",
            affectedDateFrom: "2026-04-21",
            affectedDateTo: "2026-05-02",
            createdAt: "2026-04-07T10:00:00.000Z",
            creditCost: 3,
            creditBreakdown: [
              { actionType: "move_workout", count: 2, unitCost: 0.5, subtotal: 1 },
              { actionType: "update_workout", count: 2, unitCost: 0.5, subtotal: 1 },
              { actionType: "update_exercise", count: 2, unitCost: 0.25, subtotal: 0.5 },
            ],
            actions: [
              {
                actionType: "move_workout",
                summary: "Move Tue Apr 21 workout to Wed Apr 22.",
                targetWorkoutId: "workout-11",
                previousDate: "2026-04-21",
                targetDate: "2026-04-22",
              },
              {
                actionType: "move_workout",
                summary: "Move Fri Apr 24 workout to Sat Apr 25.",
                targetWorkoutId: "workout-12",
                previousDate: "2026-04-24",
                targetDate: "2026-04-25",
              },
              {
                actionType: "update_workout",
                summary: "Reduce lower-body volume on Mon Apr 27.",
                targetWorkoutId: "workout-13",
                targetDate: "2026-04-27",
                workout: {
                  name: "Lower reset",
                  plannedAt: "2026-04-27",
                  exercises: [],
                },
              },
              {
                actionType: "update_workout",
                summary: "Rebuild Sat May 2 workout as an upper primer.",
                targetWorkoutId: "workout-14",
                targetDate: "2026-05-02",
                workout: {
                  name: "Upper primer",
                  plannedAt: "2026-05-02",
                  exercises: [],
                },
              },
            ],
          },
          previewWorkouts: [],
        }}
      />
    </StoryFrame>
  ),
};

export const PendingFutureDelete: Story = {
  render: () => (
    <StoryFrame>
      <TraineePlannerPanel
        traineeId="trainee-1"
        onGenerated={async () => {}}
        initialState={{
          sessionId: "session-2",
          description: "Delete all future workouts.",
          messages: [
            { role: "user", content: "Delete all future workouts." },
            {
              role: "assistant",
              content:
                "I staged the deletion proposal. Review the affected range before approving.",
            },
          ],
          proposedActionSet: {
            id: "proposal-delete",
            status: "pending",
            summary: "Delete all 49 upcoming workouts.",
            explanation:
              "This will remove all planned workouts from the athlete's calendar, starting from 2026-04-08.",
            affectedDateFrom: "2026-04-08",
            affectedDateTo: "2026-07-16",
            createdAt: "2026-04-07T10:00:00.000Z",
            creditCost: 5,
            creditBreakdown: [
              { actionType: "delete_workout", count: 49, unitCost: 0.25, subtotal: 12.25 },
            ],
            actions: [
              {
                actionType: "delete_workout",
                summary: "Delete workout on 2026-04-08",
                targetWorkoutId: "workout-1",
                targetDate: "2026-04-08",
              },
              {
                actionType: "delete_workout",
                summary: "Delete workout on 2026-07-16",
                targetWorkoutId: "workout-49",
                targetDate: "2026-07-16",
              },
            ],
          },
          previewWorkouts: [],
        }}
      />
    </StoryFrame>
  ),
};

export const AfterGeneration: Story = {
  render: () => (
    <StoryFrame>
      <TraineePlannerPanel
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
    </StoryFrame>
  ),
};
