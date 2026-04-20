import { getAuth } from "@/context/Auth";
import { AdaptiveTimeline } from "@/components/Adaptive/AdaptiveTimeline";

type Props = {
  params: Promise<{ traineeId: string }>;
};

export default async function AdaptiveTimelinePage({ params }: Props) {
  const { traineeId } = await params;
  const auth = await getAuth({ redirect: true });

  return (
    <AdaptiveTimeline traineeId={traineeId} accessToken={auth!.accessToken} />
  );
}
