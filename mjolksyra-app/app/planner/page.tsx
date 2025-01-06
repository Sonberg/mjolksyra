import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";

export default async function Page() {
  await getAuth({
    redirect: "/",
  });

  return <PageContent />;
}
