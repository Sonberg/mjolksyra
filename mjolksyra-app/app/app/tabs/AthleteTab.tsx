import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { AtheletePaymentDialog } from "@/dialogs/AtheletePaymentDialog";
import { useState } from "react";

export function AthleteTab() {
  const [paymentLoading, setPaymentLoading] = useState(false);

  return (
    <div>
      <div className="text-lg text-primary">
        A new athelete, welcome. You are almost ready to get going, dd your
        payment method and we can get started. You have one pending invite from:{" "}
        <strong>Natalie Sleiers</strong>
      </div>
      <div className="border-b py-4">
        <div className="text-2xl font-bold">1. Add payment method</div>
        <div className="py-8">
          <AtheletePaymentDialog
            onOpenChanged={setPaymentLoading}
            trigger={
              <Button>
                {paymentLoading ? <Spinner size={24} /> : null} Setup payment
                method
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
          2. Your invites (1 pending)
        </div>
      </div>
    </div>
  );
}
