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
import { useAuth } from "@/context/Auth";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { authApi } from "@/services/client";

type Props = {
  trigger: ReactNode;
};
export function LoginDialog({ trigger }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const auth = useAuth();
  const router = useRouter();

  const onSubmit = useCallback(async () => {
    setLoading(true);
    setFailed(false);

    try {
      const response = await authApi.authLogin({
        loginCommand: {
          email,
          password,
        },
      });

      if (!response?.isSuccessful) {
        throw new Error("failed");
      }

      auth.login(response);
      router.push("/app");
    } catch (error) {
      console.log(error);
      setFailed(true);
      setLoading(false);
    }
  }, [auth, email, password, router]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start gap-4">
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
          <div className="flex flex-col items-start gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              type="password"
              className="col-span-3"
            />
          </div>
          {failed ? (
            <div className="px-4 py-2 bg-red-900 border border-red-500 text-xs rounded-lg font-semibold">
              Incorrect username or password
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost">Forgot password</Button>
          <Button disabled={loading} onClick={onSubmit}>
            {loading ? <Spinner size={8} /> : null}
            Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
