"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { WorkoutMediaUploader } from "./WorkoutMediaUploader";
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

export const Disabled: Story = {
  render: () => (
    <WorkoutMediaUploader
      mediaUrls={["https://placehold.co/200x200?text=Photo"]}
      onUploadComplete={() => {}}
      isPending
    />
  ),
};
