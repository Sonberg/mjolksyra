"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/Auth";
import { AthleteTab } from "./tabs/AthleteTab";
import { CoachTab } from "./tabs/CoachTab";

export default function Page() {
  const auth = useAuth();

  return (
    <div className="mt-24 mx-auto w-[60rem]">
      <Tabs defaultValue="coach">
        <div className="flex justify-between items-center mb-4">
          <div className="text-4xl font-bold">Hi {auth.givenName}!</div>
          <TabsList>
            <TabsTrigger value="coach">Coach</TabsTrigger>
            <TabsTrigger value="athlete">Athlete</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="coach">
          <CoachTab />
        </TabsContent>
        <TabsContent value="athlete">
          <AthleteTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
