"use client";

import { Trainee } from "@/services/trainees/type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useGravatar } from "@/hooks/useGravatar";
import dayjs from "dayjs";
import { DumbbellIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

type Props = {
  trainee: Trainee;
};

export function CoachCard({ trainee }: Props) {
  const router = useRouter();
  const url = useGravatar(trainee.athlete.email);

  const format = useCallback((date: dayjs.Dayjs) => {
    const today = dayjs();
    const days = today.diff(date, "days");

    switch (days) {
      case -1:
        return "Yesterday";
      case 0:
        return "Today";
      case 1:
        return "Tomorrow";

      default:
        return date.format("dddd, D MMM");
    }
  }, []);

  const lastWorkoutAt = useMemo(() => {
    return trainee.lastWorkoutAt ? format(dayjs(trainee.lastWorkoutAt)) : "-";
  }, [format, trainee.lastWorkoutAt]);

  const nextWorkoutAt = useMemo(() => {
    return trainee.nextWorkoutAt ? format(dayjs(trainee.nextWorkoutAt)) : "-";
  }, [format, trainee.nextWorkoutAt]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <Avatar>
              <AvatarImage src={url} />
              <AvatarFallback>PS</AvatarFallback>
            </Avatar>
            <div>{trainee.athlete.name}</div>
          </div>
          <Badge>Active</Badge>
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
              <div className="text-xl font-bold">{nextWorkoutAt}</div>
            </CardContent>
          </Card>
          <Card className="hover:bg-accent">
            <CardContent className="p-4">
              <div className="text-sm mb-2">Last workout</div>
              <div className="text-xl font-bold">{lastWorkoutAt}</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => router.push(`/app/coach/${trainee.id}/planner`)}
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
