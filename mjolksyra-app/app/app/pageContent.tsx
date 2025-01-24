"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AthleteTab } from "./tabs/AthleteTab";
import { CoachTab } from "./tabs/CoachTab";
import { User } from "@/api/users/type";
import { useMemo } from "react";

type Props = {
  user: User;
};

export function PageContent({ user }: Props) {
  const defaultTab = useMemo(() => {
    if (user.onboarding.coach !== "NotStarted") {
      return "coach";
    }

    if (user.onboarding.athlete !== "NotStarted") {
      return "athlete";
    }

    return "coach";
  }, [user]);

  return (
    <div className="mt-24 px-6 mx-auto w-full max-w-screen-xl">
      <Tabs defaultValue={defaultTab}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-4xl font-bold">Hi {user.givenName}!</div>
          <TabsList>
            <TabsTrigger value="coach">Coach</TabsTrigger>
            <TabsTrigger value="athlete">Athlete</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="coach">
          <CoachTab user={user} />
        </TabsContent>
        <TabsContent value="athlete">
          <AthleteTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
