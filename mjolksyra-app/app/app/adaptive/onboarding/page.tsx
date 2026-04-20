import { redirect } from "next/navigation";
import { getAuth } from "@/context/Auth";
import { AdaptiveOnboardingFlow } from "@/components/Adaptive/OnboardingFlow";

export default async function AdaptiveOnboardingPage() {
  const auth = await getAuth({ redirect: true });

  return (
    <AdaptiveOnboardingFlow accessToken={auth!.accessToken} />
  );
}
