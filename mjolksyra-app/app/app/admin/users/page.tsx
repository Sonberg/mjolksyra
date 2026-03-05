import { getAuth } from "@/context/Auth";
import { getCoachRevenue } from "@/services/admin/getCoachRevenue";
import { UsersTab } from "./UsersTab";

export default async function AdminUsersPage() {
  const auth = await getAuth({ redirect: true });
  const coachRevenue = await getCoachRevenue({ accessToken: auth!.accessToken });

  return <UsersTab initialCoaches={coachRevenue} />;
}
