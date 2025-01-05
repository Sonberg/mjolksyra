import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

type Props = {
  trigger: ReactNode;
};
export function LoginDialog({ trigger }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              defaultValue="per.sonberg@gmail.com"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Name
            </Label>
            <Input
              id="password"
              defaultValue="Pedro Duarte"
              type="password"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost">Forgot password</Button>
          <Button type="submit">Login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
