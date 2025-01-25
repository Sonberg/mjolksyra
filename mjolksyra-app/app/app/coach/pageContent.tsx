"use client";

import { Trainee } from "@/api/trainees/type";
import { AthleteCard } from "./AthleteCard";

type Props = { trainees: Trainee[] };

export function PageContent({ trainees }: Props) {
  return (
    <div>
      {trainees.map((x) => (
        <AthleteCard key={x.id} trainee={x} />
      ))}
    </div>
  );
}
