import { getAuth } from "@/context/Auth";
import { getTrainees } from "@/services/trainees/getTrainees";
import { PageContent } from "./pageContent";
import { getUserMe } from "@/services/users/getUserMe";

export default async function Page() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });
  const trainees = await getTrainees({ accessToken: auth!.accessToken });

  return (
    <PageContent
      user={user}
      trainees={trainees.filter((x) => x.coach.id == auth?.userId)}
    />
  );
}
