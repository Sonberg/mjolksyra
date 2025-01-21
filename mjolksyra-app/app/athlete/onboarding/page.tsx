import { PageContent } from "./pageContent";

export default async function Page() {
  const response = await fetch(`${process.env.API_URL}/api/setup-intent`, {
    method: "POST",
  });
  const { clientSecret } = await response.json();

  return <PageContent clientSecret={clientSecret} />;
}
