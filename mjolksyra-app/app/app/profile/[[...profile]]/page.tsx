import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { ProfilePageContent } from "./pageContent";

export default async function Page() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });
  return <ProfilePageContent user={user} />;
}
