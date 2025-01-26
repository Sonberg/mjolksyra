import { ApiClient } from "@/api/client";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

type Account = { accountId: string };
type Link = { url: string };

export function CoachOnboarding() {
  const [isLoading, setLoading] = useState(false);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const account = await ApiClient.post<Account>("/api/stripe/account");
      const link = await ApiClient.post<Link>("/api/stripe/account/link", {
        accountId: account.data.accountId,
        baseUrl: location.origin,
      });

      window.open(link.data.url, "_blank");
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  }, []);

  return (
    <div>
      <div className="text-lg text-primary">
        A new coach, welcome. You are almost ready to start, add your payment
        method and we can get started.
      </div>
      <div className="border-b py-4">
        <div className="text-2xl font-bold">1. Configure payments</div>
        <div className="py-8">
          <Button disabled={isLoading} onClick={start}>
            {isLoading ? <Spinner size={24} /> : null} Setup payment
          </Button>
        </div>
        <div className="">
          <Button size="sm" variant="secondary">
            Next
          </Button>
        </div>
      </div>
      <div className="border-b py-4">
        <div className="text-2xl font-bold text-muted">
          2. Invite your first athlete
        </div>
      </div>
    </div>
  );
}
