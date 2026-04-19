"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatMessageAttachmentBar } from "./ChatMessageAttachmentBar";
import { ChatMessageComposer } from "./ChatMessageComposer";
import { ChatMessageTyping } from "./ChatMessageTyping";

const meta = {
  title: "Chat/Primitives",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MessageFromCoach: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <ChatMessage align="end" label="Coach">
        Solid effort today. How did set 3 feel?
      </ChatMessage>
    </div>
  ),
};

export const MessageFromAthlete: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <ChatMessage align="start" label="Athlete">
        Pretty hard, but I kept depth on all reps.
      </ChatMessage>
    </div>
  ),
};

export const MessageFromPlanner: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <ChatMessage align="start" label="Planner">
        Here is a 12-week strength block with 3 sessions per week, progressing
        the squat, bench, and deadlift in linear fashion.
      </ChatMessage>
    </div>
  ),
};

export const MessageWithTimestamp: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <ChatMessage
        align="end"
        label="Coach"
        timestamp={new Date("2026-04-03T08:10:00Z")}
      >
        Keep the same load next week and add one rep on the final set.
      </ChatMessage>
      <ChatMessage
        align="start"
        label="Athlete"
        timestamp={new Date("2026-04-03T08:13:00Z")}
        isEdited
      >
        Understood. Will do.
      </ChatMessage>
    </div>
  ),
};

export const Conversation: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <ChatMessage align="end" label="Coach">
        Build a 12-week strength block for a powerlifter, 3 days per week.
      </ChatMessage>
      <ChatMessage align="start" label="Planner">
        Got it. Should I emphasise the competition lifts throughout, or include
        a hypertrophy phase in the first block?
      </ChatMessage>
      <ChatMessage align="start" label="Planner">
        <ChatMessageTyping />
      </ChatMessage>
    </div>
  ),
};

export const TypingIndicator: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <ChatMessage align="start" label="Planner">
        <ChatMessageTyping />
      </ChatMessage>
    </div>
  ),
};

export const Composer: Story = {
  render: () => (
    <div className="max-w-lg">
      <ChatMessageComposer
        value=""
        onChange={() => {}}
        onSend={() => {}}
        canSend={false}
        placeholder="Write a message..."
      />
    </div>
  ),
};

export const ComposerWithContent: Story = {
  render: () => (
    <div className="max-w-lg">
      <ChatMessageComposer
        value="Build a 12-week strength block"
        onChange={() => {}}
        onSend={() => {}}
        canSend
        placeholder="Write a message..."
      />
    </div>
  ),
};

function AttachmentBarFixture({
  attachedFiles = [],
  isAttachmentDragActive = false,
}: {
  attachedFiles?: { name: string }[];
  isAttachmentDragActive?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="max-w-lg bg-[var(--shell-surface-strong)] p-3">
      <ChatMessageAttachmentBar
        fileInputRef={ref}
        fileInputId="story-attachment-input"
        attachedFiles={attachedFiles}
        isAttachmentDragActive={isAttachmentDragActive}
        label="Attach context"
        accept=".json,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.webp"
        onAttachmentClick={() => ref.current?.click()}
        onRemoveFile={() => {}}
        onFileChange={() => {}}
      />
    </div>
  );
}

export const AttachmentBarEmpty: Story = {
  render: () => <AttachmentBarFixture />,
};

export const AttachmentBarWithFiles: Story = {
  render: () => (
    <AttachmentBarFixture
      attachedFiles={[
        { name: "program.xlsx" },
        { name: "notes.txt" },
        { name: "athlete-photo.jpg" },
      ]}
    />
  ),
};

export const AttachmentBarDragActive: Story = {
  render: () => <AttachmentBarFixture isAttachmentDragActive />,
};

export const ComposerWithAttachmentBar: Story = {
  render: () => {
    const ref = useRef<HTMLInputElement>(null);
    return (
      <div className="max-w-lg">
        <ChatMessageComposer
          value="Build a 12-week strength block"
          onChange={() => {}}
          onSend={() => {}}
          canSend
          rows={3}
          placeholder="Describe the block..."
        >
          <ChatMessageAttachmentBar
            fileInputRef={ref}
            fileInputId="composer-attachment-input"
            attachedFiles={[{ name: "program.xlsx" }, { name: "notes.txt" }]}
            isAttachmentDragActive={false}
            label="Attach"
            accept=".json,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.webp"
            onAttachmentClick={() => ref.current?.click()}
            onRemoveFile={() => {}}
            onFileChange={() => {}}
          />
        </ChatMessageComposer>
      </div>
    );
  },
};
