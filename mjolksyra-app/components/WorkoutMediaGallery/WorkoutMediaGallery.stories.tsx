"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { WorkoutMediaGallery } from "./WorkoutMediaGallery";

const meta = {
  title: "WorkoutMediaGallery/WorkoutMediaGallery",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImagesOnly: Story = {
  render: () => (
    <WorkoutMediaGallery
      mediaUrls={[
        "https://placehold.co/400x400?text=Photo+1",
        "https://placehold.co/400x400?text=Photo+2",
        "https://placehold.co/400x400?text=Photo+3",
      ]}
    />
  ),
};

export const VideosOnly: Story = {
  render: () => (
    <WorkoutMediaGallery
      mediaUrls={[
        "https://example.com/workout-clip-1.mp4",
        "https://example.com/workout-clip-2.mp4",
      ]}
    />
  ),
};

export const Mixed: Story = {
  render: () => (
    <WorkoutMediaGallery
      mediaUrls={[
        "https://placehold.co/400x400?text=Photo+1",
        "https://example.com/workout-clip.mp4",
        "https://placehold.co/400x400?text=Photo+2",
      ]}
    />
  ),
};

export const Empty: Story = {
  render: () => <WorkoutMediaGallery mediaUrls={[]} />,
};
