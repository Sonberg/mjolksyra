import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NewSessionDialog } from "./NewSessionDialog";

const meta = {
  title: "WorkoutViewer/NewSessionDialog",
  component: NewSessionDialog,
} satisfies Meta<typeof NewSessionDialog>;

export default meta;
type Story = StoryObj<typeof NewSessionDialog>;

export const Open: Story = {
  render: () => (
    <NewSessionDialog
      traineeId="trainee-1"
      open
      onOpenChange={() => {}}
      onCreated={() => {}}
    />
  ),
};
