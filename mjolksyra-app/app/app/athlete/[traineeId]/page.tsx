import { getTrainees } from "@/services/trainees/getTrainees";
import { getAuth } from "@/context/Auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ traineeId: string }>;
};

export default async function Page({ params }: Props) {
  const auth = await getAuth({ redirect: true });
  const trainees = await getTrainees({ accessToken: auth?.accessToken });
  const routeParams = await params;
  const trainee = trainees.find((x) => x.id === routeParams.traineeId);

  if (trainee) {
    redirect(`/app/athlete?coachTraineeId=${trainee.id}`);
  }

  return redirect("/");
}
