import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/api/users/getUserMe";
import { redirect } from "next/navigation";

export default async function Page() {
  const auth = await getAuth({
    redirect: true,
  });

  const user = await getUserMe({
    accessToken: auth!.accessToken!,
  });

  if (user.onboarding.coach !== "NotStarted") {
    redirect("/app/coach");
  }

  if (user.onboarding.athlete !== "NotStarted") {
    redirect("/app/athlete");
  }

  redirect("/app/coach");
}
