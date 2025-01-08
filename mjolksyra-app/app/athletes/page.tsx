import { getAuth } from "@/context/Auth";
import { getTrainees } from "@/api/trainees/getTrainees";
import { PageContent } from "./pageContent";

export default async function Page() {
  const auth = await getAuth({ redirect: true });
  const trainees = await getTrainees({ accessToken: auth?.accessToken });

  return (
    <PageContent
      trainees={trainees.filter((x) => x.coach.id == auth?.userId)}
    />
  );
}
