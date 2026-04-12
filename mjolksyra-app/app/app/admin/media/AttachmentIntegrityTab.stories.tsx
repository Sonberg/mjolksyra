"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AttachmentIntegrityTab } from "./AttachmentIntegrityTab";

const meta = {
  title: "Admin/AttachmentIntegrityTab",
  component: AttachmentIntegrityTab,
} satisfies Meta<typeof AttachmentIntegrityTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    report: {
      generatedAt: new Date("2026-04-12T10:15:00.000Z"),
      summary: {
        totalReferencedMediaUrls: 148,
        totalR2Objects: 163,
        orphanObjectCount: 6,
        rawWithCompressedCount: 18,
        deadReferenceCount: 4,
      },
      orphanObjects: [
        {
          key: "workouts/trainee-a/orphan-1.webp",
          sizeBytes: 182344,
          lastModifiedAt: new Date("2026-04-08T09:12:00.000Z"),
        },
        {
          key: "workouts/trainee-b/orphan-2.mp4",
          sizeBytes: 44122344,
          lastModifiedAt: new Date("2026-04-06T17:42:00.000Z"),
        },
      ],
      rawWithCompressed: [
        {
          sourceType: "completed-workout-chat-media",
          traineeId: "trainee-1",
          ownerId: "chat-1",
          rawUrl: "https://media.example.com/workouts/raw-1.mov?raw=1",
          rawKey: "workouts/raw-1.mov",
          compressedUrl: "https://media.example.com/workouts/raw-1-compressed.mp4",
          compressedKey: "workouts/raw-1-compressed.mp4",
        },
      ],
      deadReferences: [
        {
          sourceType: "completed-workout-media",
          traineeId: "trainee-2",
          ownerId: "workout-44",
          url: "https://media.example.com/workouts/missing-file.webp?raw=1",
          key: "workouts/missing-file.webp",
          reason: "R2 object is missing.",
        },
      ],
    },
  },
};
