"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getTrainee } from "@/services/trainees/getTrainee";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
export default function Layout({ children }: Props) {
  const params = useParams<{ traineeId: string }>();
  const traineeId = params?.traineeId;
  const { data } = useQuery({
    queryKey: ["trainees", traineeId, "layout"],
    queryFn: ({ signal }) => getTrainee({ id: traineeId, signal }),
    enabled: !!traineeId,
  });

  const coachName =
    data?.coach?.givenName || data?.coach?.familyName
      ? `${data?.coach?.givenName ?? ""} ${data?.coach?.familyName ?? ""}`.trim()
      : data?.coach?.name || "Your Coach";

  return (
    <>
      <div className="min-h-16 px-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/80">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Workouts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-3 px-2 h-full cursor-pointer">
          <ChevronDown className="h-5 w-5 text-zinc-400" />
          <div className="">
            <div className="text-zinc-500 text-xs">Coach</div>
            <div className="text-sm text-zinc-200">{coachName}</div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
