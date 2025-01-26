"use client";

import { User } from "@/api/users/type";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { AtheletePaymentDialog } from "@/dialogs/AtheletePaymentDialog";
import { useState } from "react";

type Props = {
  user: User;
};

export function AthleteOnboarding({ user }: Props) {
  const [isLoading, setLoading] = useState(false);

  return (
    <div>
      <div className="text-lg text-primary">
        A new athelete, welcome. You are almost ready to get going, dd your
        payment method and we can get started.
      </div>
      <div className="border-b py-4">
        <div className="text-2xl font-bold">1. Add payment method</div>
        <div className="py-8">
          <AtheletePaymentDialog
            onOpenChanged={setLoading}
            trigger={
              <Button>
                {isLoading ? <Spinner size={24} /> : null} Setup payment
              </Button>
            }
          />
        </div>
        <div className="">
          <Button size="sm" variant="secondary">
            Next
          </Button>
        </div>
      </div>
      <div className="border-b py-4">
        <div className="text-2xl font-bold text-muted">
          2. Your invites{" "}
          {user.coaches.length ? (
            <span>({user.coaches.length} pending)</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
