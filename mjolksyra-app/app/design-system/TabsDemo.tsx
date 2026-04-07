"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function TabsDemo() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="mt-3 text-sm text-[var(--shell-muted)]">
          Overview content lives here. This tab is active by default.
        </p>
      </TabsContent>
      <TabsContent value="history">
        <p className="mt-3 text-sm text-[var(--shell-muted)]">
          History content lives here.
        </p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="mt-3 text-sm text-[var(--shell-muted)]">
          Settings content lives here.
        </p>
      </TabsContent>
    </Tabs>
  );
}
