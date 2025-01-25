import { getUserMe } from "@/api/users/getUserMe";
import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";

export default async function Page() {
  const auth = await getAuth({
    redirect: true,
  });

  const user = await getUserMe({
    accessToken: auth!.accessToken!,
  });

  return <PageContent user={user} />;
}
