"use client";

import { Trainee } from "@/api/trainees/type";
import { AthleteCard } from "./AthleteCard";

type Props = { trainees: Trainee[] };

export function PageContent({ trainees }: Props) {
  return (
    <div className="p-6">
      {trainees.map((x) => (
        <AthleteCard key={x.id} trainee={x} />
      ))}
    </div>
  );
}
