import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";
import { getUserMe } from "@/services/users/getUserMe";
import { getHeaders, traineesApi } from "@/services/client";

export default async function Page() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });
  const trainees = await traineesApi.traineesGetAll({
    headers: getHeaders(auth?.accessToken),
  });

  return (
    <PageContent
      user={user}
      trainees={trainees.filter((x) => x.coach.id == auth?.userId)}
    />
  );
}
