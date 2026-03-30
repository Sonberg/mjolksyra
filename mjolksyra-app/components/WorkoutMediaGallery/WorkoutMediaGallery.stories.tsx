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
      media={[
        { rawUrl: "https://placehold.co/400x400?text=Photo+1", compressedUrl: null, type: "Image" },
        { rawUrl: "https://placehold.co/400x400?text=Photo+2", compressedUrl: null, type: "Image" },
        { rawUrl: "https://placehold.co/400x400?text=Photo+3", compressedUrl: null, type: "Image" },
      ]}
    />
  ),
};

export const VideosOnly: Story = {
  render: () => (
    <WorkoutMediaGallery
      media={[
        { rawUrl: "https://example.com/workout-clip-1.mp4", compressedUrl: null, type: "Video" },
        { rawUrl: "https://example.com/workout-clip-2.mp4", compressedUrl: null, type: "Video" },
      ]}
    />
  ),
};

export const Mixed: Story = {
  render: () => (
    <WorkoutMediaGallery
      media={[
        { rawUrl: "https://placehold.co/400x400?text=Photo+1", compressedUrl: null, type: "Image" },
        { rawUrl: "https://example.com/workout-clip.mp4", compressedUrl: null, type: "Video" },
        { rawUrl: "https://placehold.co/400x400?text=Photo+2", compressedUrl: null, type: "Image" },
      ]}
    />
  ),
};

export const WithCompressed: Story = {
  render: () => (
    <WorkoutMediaGallery
      media={[
        {
          rawUrl: "https://placehold.co/400x400?text=Raw",
          compressedUrl: "https://placehold.co/400x400?text=Compressed",
          type: "Image",
        },
      ]}
    />
  ),
};

export const Empty: Story = {
  render: () => <WorkoutMediaGallery media={[]} />,
};
