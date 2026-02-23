import { getAuth } from "@/context/Auth";
import { getTrainees } from "@/services/trainees/getTrainees";
import { getUserMe } from "@/services/users/getUserMe";
import { AthletesPageContent } from "./pageContent";

export default async function Page() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });
  const trainees =
    user.onboarding.coach === "Completed"
      ? await getTrainees({ accessToken: auth!.accessToken! })
      : [];

  return <AthletesPageContent user={user} trainees={trainees} />;
}
