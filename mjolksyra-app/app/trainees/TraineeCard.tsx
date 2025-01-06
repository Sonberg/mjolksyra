"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/Auth";
import { DumbbellIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function TraineeCard() {
  const router = useRouter();
  const auth = useAuth();

  return (
    <Card id={auth.userId ?? ""}>
      <CardHeader>
        <CardTitle className=" flex justify-between items-center">
          <div>Per Sonberg</div> <Badge>Active</Badge>
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Card className="hover:bg-accent">
            <CardContent className="p-4">
              <div className="text-sm mb-2">Price (monthly)</div>
              <div className="text-xl font-bold">1000 kr</div>
            </CardContent>
          </Card>
          <Card className="hover:bg-accent">
            <CardContent className="p-4">
              <div className="text-sm  mb-2">Next workout</div>
              <div className="text-xl font-bold">Today</div>
            </CardContent>
          </Card>
          <Card className="hover:bg-accent">
            <CardContent className="p-4">
              <div className="text-sm mb-2">Last workout</div>
              <div className="text-xl font-bold">Tomorrow</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="grid place-items-end">
        <Button
          onClick={() => router.push("/planner")}
          size="sm"
          variant="secondary"
        >
          <DumbbellIcon />
          Plan
        </Button>
      </CardFooter>
    </Card>
  );
}
