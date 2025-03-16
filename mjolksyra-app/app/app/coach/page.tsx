import { getAuth } from "@/context/Auth";
import { PageContent } from "./pageContent";
import { getUserMe } from "@/services/users/getUserMe";
import { getHeaders, traineesApi } from "@/services/client";

export default async function Page() {
  const auth = await getAuth({ redirect: true });
  const user = await getUserMe({ accessToken: auth!.accessToken! });

  return (
    <PageContent
      user={user}
      trainees={[
        {
          id: "1",
          createdAt: new Date(),
          athlete: {
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            givenName: "",
            familyName: "",
          },
          coach: {
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            givenName: "",
            familyName: "",
          },
          cost: {
            currency: "USD",
            applicationFee: 10,
            coach: 10,
            total: 20,
          },
          nextWorkoutAt: new Date(),
          lastWorkoutAt: new Date(),
        },
      ]}
    />
  );
}
