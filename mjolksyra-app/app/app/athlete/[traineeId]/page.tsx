import { getTrainees } from "@/services/trainees/getTrainees";
import { getAuth } from "@/context/Auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const auth = await getAuth({ redirect: true });
  const trainees = await getTrainees({ accessToken: auth?.accessToken });
  const traiee = trainees.find((x) => x.athlete.id === auth?.userId);

  if (traiee) {
    redirect(`/${traiee.id}/workouts`);
  }

  return redirect("/");
}
