import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";
import { getUserMe } from "@/services/users/getUserMe";
import { getTrainees } from "@/services/trainees/getTrainees";

export default async function Page() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });
  const trainees = await getTrainees({ accessToken: auth!.accessToken! });

  return <PageContent user={user} trainees={trainees} />;
}
