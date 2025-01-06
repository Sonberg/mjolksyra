import { ReactNode, useState } from "react";
import { z } from "zod";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useValidation } from "@/hooks/useValidation";

const schema = z.object({
  email: z.string().email(),
});

type Props = {
  trigger: ReactNode;
};

export function InviteTraineeDialog({ trigger }: Props) {
  const [email, setEmail] = useState("");

  const validation = useValidation({ schema, values: { email } });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite trainee</DialogTitle>
          <DialogDescription>How would you like to coach?</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center gap-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="col-span-3"
              onBlur={(ev) => {
                validation.showError(ev.target.id);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              validation.showAllError();
            }}
          >
            Send invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
