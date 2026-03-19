import type { Meta, StoryObj } from "@storybook/react";
import { UserCreditPurchase } from "./UserCreditPurchase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { CreditPack } from "@/services/aiCreditPacks/getCreditPacks";

const meta: Meta<typeof UserCreditPurchase> = {
  title: "Coach/UserCreditPurchase",
  component: UserCreditPurchase,
  decorators: [
    (Story) => {
      const client = new QueryClient();
      return (
        <QueryClientProvider client={client}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof UserCreditPurchase>;

const mockPacks: CreditPack[] = [
  { id: "20000000-0000-0000-0000-000000000001", name: "Small", credits: 25, priceSek: 39 },
  { id: "20000000-0000-0000-0000-000000000002", name: "Medium", credits: 100, priceSek: 119 },
  { id: "20000000-0000-0000-0000-000000000003", name: "Large", credits: 300, priceSek: 299 },
];

export const Default: Story = {
  decorators: [
    (Story) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      client.setQueryData(["ai-credit-packs"], mockPacks);
      return (
        <QueryClientProvider client={client}>
          <div className="max-w-lg p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      // Don't seed data so it stays in loading state
      return (
        <QueryClientProvider client={client}>
          <div className="max-w-lg p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};
