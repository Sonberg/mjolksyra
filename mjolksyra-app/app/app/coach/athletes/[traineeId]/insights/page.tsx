import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";

type Props = {
  params: Promise<{ traineeId: string }>;
};

export default async function Page({ params }: Props) {
  await getAuth({
    redirect: "/",
  });

  const routeParams = await params;

  return <PageContent traineeId={routeParams.traineeId} />;
}
