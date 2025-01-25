import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";

type Props = {
  params: Promise<{ traineeId: string }>;
};

export default async function Page({ params }: Props) {
  await getAuth({
    redirect: "/",
  });

  return <PageContent traineeId={(await params).traineeId} />;
}
