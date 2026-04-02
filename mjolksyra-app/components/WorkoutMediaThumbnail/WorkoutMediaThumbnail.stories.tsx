"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { XIcon } from "lucide-react";
import { WorkoutMediaThumbnail } from "./WorkoutMediaThumbnail";

const meta = {
  title: "WorkoutMediaThumbnail/WorkoutMediaThumbnail",
  component: WorkoutMediaThumbnail,
} satisfies Meta<typeof WorkoutMediaThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {
  args: {
    src: "https://placehold.co/400x400?text=Photo",
    alt: "Workout media 1",
  },
};

export const Video: Story = {
  args: {
    src: "https://example.com/workout-video.mp4",
    alt: "Workout video",
    isVideo: true,
  },
};

export const PendingImage: Story = {
  args: {
    src: "https://placehold.co/400x400?text=Uploading",
    alt: "Uploading...",
    isPending: true,
  },
};

export const PendingVideo: Story = {
  args: {
    alt: "Uploading...",
    isVideo: true,
    isPending: true,
  },
};

export const WithActionButton: Story = {
  args: {
    src: "https://placehold.co/400x400?text=Photo",
    alt: "Workout media with action",
    actionButton: (
      <button
        type="button"
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center bg-[var(--shell-surface)]/90 text-[var(--shell-ink)]"
        aria-label="Remove image"
      >
        <XIcon className="h-3 w-3" />
      </button>
    ),
  },
};
