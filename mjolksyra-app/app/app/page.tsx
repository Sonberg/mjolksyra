"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/Auth";
import { AtheletePaymentDialog } from "@/dialogs/AtheletePaymentDialog";

export default function Page() {
  const auth = useAuth();

  return (
    <div className="mt-24 mx-auto w-[60rem]">
      <div className="text-4xl font-bold">Hi {auth.givenName}!</div>
      <div className="mt-8">
        <div className="font-light text-accent-foreground mb-4">
          Lets get you started
        </div>
        <div className="text-3xl font-bold mb-20">
          Are you{" "}
          <span className="bg-muted px-2 py-1 cursor-pointer">Coach</span> or{" "}
          <span className="bg-muted px-2 py-1 cursor-pointer">Athlete</span>?
        </div>
        <AtheletePaymentDialog trigger={<Button>Add payments</Button>} />
      </div>
    </div>
  );
}
