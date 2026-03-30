"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { WorkoutMediaUploader } from "./WorkoutMediaUploader";
import type { PendingPreview } from "./WorkoutMediaUploader";
import { useState } from "react";
import type { PlannedWorkout } from "@/services/plannedWorkouts/type";

type PlannedWorkoutMedia = PlannedWorkout["media"][number];

const meta = {
  title: "WorkoutMediaUploader/WorkoutMediaUploader",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initial }: { initial: PlannedWorkoutMedia[] }) {
  const [media, setMedia] = useState<PlannedWorkoutMedia[]>(initial);
  return (
    <WorkoutMediaUploader
      traineeId="trainee-1"
      plannedWorkoutId="workout-1"
      media={media}
      onUploadComplete={setMedia}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled initial={[]} />,
};

export const WithExistingUploads: Story = {
  render: () => (
    <Controlled
      initial={[
        { rawUrl: "https://placehold.co/200x200?text=Image+1", compressedUrl: null, type: "Image" },
        { rawUrl: "https://placehold.co/200x200?text=Image+2", compressedUrl: null, type: "Image" },
        { rawUrl: "https://example.com/workout-video.mp4", compressedUrl: null, type: "Video" },
      ]}
    />
  ),
};

/** R2-format URLs with object keys that include file extensions. */
export const WithR2Urls: Story = {
  render: () => (
    <Controlled
      initial={[
        { rawUrl: "https://media.example.com/workouts/abc123def456.webp?raw=1", compressedUrl: "https://media.example.com/workouts/abc123def456.webp", type: "Image" },
        { rawUrl: "https://media.example.com/workouts/ghi789jkl012.webp?raw=1", compressedUrl: null, type: "Image" },
        { rawUrl: "https://media.example.com/workouts/mno345pqr678.mp4?raw=1", compressedUrl: null, type: "Video" },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <WorkoutMediaUploader
      traineeId="trainee-1"
      plannedWorkoutId="workout-1"
      media={[{ rawUrl: "https://placehold.co/200x200?text=Photo", compressedUrl: null, type: "Image" }]}
      onUploadComplete={() => {}}
      isPending
    />
  ),
};

/** Shows the upload-in-progress UI state — one image and one video being uploaded. */
export const Uploading: Story = {
  render: () => {
    const testPreviews: PendingPreview[] = [
      {
        id: "preview-img-1",
        localUrl: "https://placehold.co/80x80?text=Photo",
        isVideo: false,
        name: "workout-photo.jpg",
      },
      {
        id: "preview-vid-1",
        localUrl: "",
        isVideo: true,
        name: "workout-video.mp4",
      },
    ];

    return (
      <WorkoutMediaUploader
        traineeId="trainee-1"
        plannedWorkoutId="workout-1"
        media={[]}
        onUploadComplete={() => {}}
        _testPendingPreviews={testPreviews}
      />
    );
  },
};
