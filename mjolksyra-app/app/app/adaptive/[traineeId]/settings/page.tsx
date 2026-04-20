import { getAuth } from "@/context/Auth";
import { AdaptiveSettings } from "@/components/Adaptive/AdaptiveSettings";

type Props = {
  params: Promise<{ traineeId: string }>;
};

export default async function AdaptiveSettingsPage({ params }: Props) {
  const { traineeId } = await params;
  const auth = await getAuth({ redirect: true });

  return (
    <AdaptiveSettings accessToken={auth!.accessToken} />
  );
}
