import { getAuth } from "@/context/Auth";
import { getUserMe } from "@/services/users/getUserMe";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const auth = await getAuth({
    redirect: true,
  });

  const user = await getUserMe({
    accessToken: auth!.accessToken!,
  });

  const cookieStore = await cookies();
  const cookieRole = cookieStore.get("mjolksyra-active-role")?.value as
    | "coach"
    | "athlete"
    | undefined;

  // Respect the user's stored role preference before falling back to defaults.
  if (cookieRole === "athlete" && user.onboarding.athlete !== "NotStarted") {
    redirect("/app/athlete");
  }
  if (cookieRole === "coach" && user.onboarding.coach !== "NotStarted") {
    redirect("/app/coach");
  }

  // Fallback: redirect to the first completed role.
  if (user.onboarding.coach !== "NotStarted") {
    redirect("/app/coach");
  }

  if (user.onboarding.athlete !== "NotStarted") {
    redirect("/app/athlete");
  }

  redirect("/app/coach");
}
