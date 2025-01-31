import { User } from "@/api/users/type";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { AtheletePaymentDialog } from "@/dialogs/AtheletePaymentDialog";
import { ReactNode, useState } from "react";

type Props = {
  user: User;
};

export function AthleteOnboarding({ user }: Props) {
  const [isLoading, setLoading] = useState(false);

  const card = (
    title: string | null,
    text: string | null,
    button: ReactNode | null
  ) => {
    return (
      <div className="mb-16">
        <div>
          {title ? <CardTitle children={title} /> : null}
          {text ? <div className="py-4" children={text} /> : null}
        </div>
        {button ? <div className="mt-4">{button}</div> : null}
      </div>
    );
  };

  switch (user.onboarding.athlete) {
    case "Completed":
      return null;

    case "NotStarted":
    case "Started":
      return card(
        "Onboarding",
        "Almost there, you only need to add payment method.",
        <AtheletePaymentDialog
          onOpenChanged={setLoading}
          trigger={
            <Button>{isLoading ? <Spinner size={24} /> : null} Setup</Button>
          }
        />
      );
  }
}
