import { getAuth } from "@/context/Auth";
import { BlocksPageContent } from "./page-content";

export default async function Page() {
  await getAuth({ redirect: "/" });

  return <BlocksPageContent />;
}
