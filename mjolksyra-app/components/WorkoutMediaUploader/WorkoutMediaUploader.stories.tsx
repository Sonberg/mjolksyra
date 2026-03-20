"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { WorkoutMediaUploader } from "./WorkoutMediaUploader";
import type { PendingPreview } from "./WorkoutMediaUploader";
import { useState } from "react";

const meta = {
  title: "WorkoutMediaUploader/WorkoutMediaUploader",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initial }: { initial: string[] }) {
  const [mediaUrls, setMediaUrls] = useState<string[]>(initial);
  return (
    <WorkoutMediaUploader
      traineeId="trainee-1"
      plannedWorkoutId="workout-1"
      mediaUrls={mediaUrls}
      onUploadComplete={setMediaUrls}
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
        "https://placehold.co/200x200?text=Image+1",
        "https://placehold.co/200x200?text=Image+2",
        "https://example.com/workout-video.mp4",
      ]}
    />
  ),
};

/** R2-format URLs with object keys that include file extensions. */
export const WithR2Urls: Story = {
  render: () => (
    <Controlled
      initial={[
        "https://media.example.com/workouts/abc123def456.webp",
        "https://media.example.com/workouts/ghi789jkl012.webp",
        "https://media.example.com/workouts/mno345pqr678.mp4",
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <WorkoutMediaUploader
      traineeId="trainee-1"
      plannedWorkoutId="workout-1"
      mediaUrls={["https://placehold.co/200x200?text=Photo"]}
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
        mediaUrls={[]}
        onUploadComplete={() => {}}
        _testPendingPreviews={testPreviews}
      />
    );
  },
};
