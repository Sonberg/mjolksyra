import { useCallback, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { login } from "@/api/auth/login";
import { useAuth } from "@/context/Auth";
import { useRouter } from "next/navigation";

type Props = {
  trigger: ReactNode;
};
export function LoginDialog({ trigger }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = useAuth();
  const router = useRouter();

  const onSubmit = useCallback(async () => {
    const response = await login({
      email,
      password,
    });

    if (!response?.isSuccessful) {
      return;
    }

    auth.login(response);
    router.push("/planner");
  }, [email, password]);

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
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Name
            </Label>
            <Input
              id="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              type="password"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost">Forgot password</Button>
          <Button onClick={onSubmit}>Login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
