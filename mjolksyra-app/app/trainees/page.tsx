import { getAuth } from "@/context/Auth";
import { cookies } from "next/headers";
import { TraineeCard } from "./TraineeCard";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const auth = await getAuth();

  return (
    <div className="p-6">
      <TraineeCard />
    </div>
  );
}
