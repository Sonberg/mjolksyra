"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { AthleteExerciseCard } from "./AthleteExerciseCard"
import { ExercisePrescriptionTargetType } from "@/lib/exercisePrescription"
import { WorkoutExercise } from "@/components/WorkoutViewer/workout/types"

const meta = {
  title: "AthleteWorkoutLogger/AthleteExerciseCard",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const baseExercise: WorkoutExercise = {
  id: "ex-1",
  exerciseId: "exercise-squat",
  name: "Barbell Back Squat",
  note: null,
  isPublished: true,
  isDone: false,
  images: [],
  prescription: {
    targetType: ExercisePrescriptionTargetType.SetsReps,
    sets: [
      { target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null }, actual: null },
      { target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null }, actual: null },
      { target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null }, actual: null },
    ],
  },
}

function noop() {}

function Fixture({ exercise, isToggleExerciseDonePending = false }: { exercise: WorkoutExercise; isToggleExerciseDonePending?: boolean }) {
  return (
    <div className="max-w-md p-4">
      <AthleteExerciseCard
        exercise={exercise}
        index={0}
        isToggleExerciseDonePending={isToggleExerciseDonePending}
        isSetActionPending={false}
        onToggleExerciseDone={noop}
        onToggleSetDone={noop}
        onUpdateSetActual={noop}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <Fixture exercise={baseExercise} />,
}

export const ExerciseDone: Story = {
  render: () => (
    <Fixture
      exercise={{
        ...baseExercise,
        isDone: true,
        prescription: {
          ...baseExercise.prescription!,
          sets: baseExercise.prescription!.sets!.map((s) => ({
            ...s,
            actual: {
              reps: s.target?.reps ?? null,
              weightKg: s.target?.weightKg ?? null,
              durationSeconds: null,
              distanceMeters: null,
              note: null,
              isDone: true,
            },
          })),
        },
      }}
    />
  ),
}

export const Pending: Story = {
  render: () => <Fixture exercise={baseExercise} isToggleExerciseDonePending={true} />,
}

export const WithNote: Story = {
  render: () => (
    <Fixture
      exercise={{
        ...baseExercise,
        note: "Keep your chest up and drive through your heels. Focus on depth.",
      }}
    />
  ),
}

export const NoPrescription: Story = {
  render: () => (
    <Fixture
      exercise={{
        ...baseExercise,
        prescription: null,
      }}
    />
  ),
}

export const DurationType: Story = {
  render: () => (
    <Fixture
      exercise={{
        ...baseExercise,
        name: "Plank Hold",
        prescription: {
          targetType: ExercisePrescriptionTargetType.DurationSeconds,
          sets: [
            { target: { reps: null, durationSeconds: 60, distanceMeters: null, weightKg: null, note: null }, actual: null },
            { target: { reps: null, durationSeconds: 60, distanceMeters: null, weightKg: null, note: null }, actual: null },
          ],
        },
      }}
    />
  ),
}

export const DistanceType: Story = {
  render: () => (
    <Fixture
      exercise={{
        ...baseExercise,
        name: "5K Run",
        prescription: {
          targetType: ExercisePrescriptionTargetType.DistanceMeters,
          sets: [
            { target: { reps: null, durationSeconds: null, distanceMeters: 5000, weightKg: null, note: null }, actual: null },
          ],
        },
      }}
    />
  ),
}

export const PartialSets: Story = {
  render: () => (
    <Fixture
      exercise={{
        ...baseExercise,
        prescription: {
          ...baseExercise.prescription!,
          sets: [
            {
              target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null },
              actual: { reps: 5, weightKg: 100, durationSeconds: null, distanceMeters: null, note: null, isDone: true },
            },
            {
              target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null },
              actual: { reps: 5, weightKg: 100, durationSeconds: null, distanceMeters: null, note: null, isDone: true },
            },
            {
              target: { reps: 5, durationSeconds: null, distanceMeters: null, weightKg: 100, note: null },
              actual: null,
            },
          ],
        },
      }}
    />
  ),
}
