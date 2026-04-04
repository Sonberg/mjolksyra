import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TraineeInvitation } from "@/services/traineeInvitations/type"
import { TraineeInvitationCard } from "./TraineeInvitationCard"
import dayjs from "dayjs"

const invitation: TraineeInvitation = {
  id: "inv1",
  email: "new.athlete@example.com",
  monthlyPriceAmount: 1000,
  coach: { givenName: "Per", familyName: "Sonberg" },
  acceptedAt: null,
  rejectedAt: null,
  createdAt: dayjs().subtract(2, "day").toDate(),
}

const meta = {
  title: "Coach/TraineeInvitationCard",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <TraineeInvitationCard invitation={invitation} />,
}
