import { getAuth } from "@/context/Auth";
import { AiCoachView } from "@/components/Adaptive/AiCoachView";

type Props = {
  params: Promise<{ traineeId: string }>;
};

export default async function AdaptiveCoachPage({ params }: Props) {
  const { traineeId } = await params;
  const auth = await getAuth({ redirect: true });

  return (
    <AiCoachView traineeId={traineeId} accessToken={auth!.accessToken} />
  );
}
