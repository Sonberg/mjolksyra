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
import { login } from "@/services/auth/login";
import { useAuth } from "@/context/Auth";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { useValidation } from "@/hooks/useValidation";
import { z } from "zod";
import { CheckIcon } from "lucide-react";
import { forgotPassword } from "@/services/auth/forgotPassword";

type Mode = "forgotPassword" | "login";
type Props = {
  trigger: ReactNode;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Invalid password"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export function LoginDialog({ trigger }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);

  const auth = useAuth();
  const router = useRouter();

  const validation = useValidation({
    values: mode === "forgotPassword" ? { email } : { email, password },
    schema: mode === "forgotPassword" ? forgotPasswordSchema : loginSchema,
  });

  const onLogin = useCallback(async () => {
    if (!validation.success) {
      validation.showAllError();
      return;
    }

    setLoading(true);
    setFailed(false);

    try {
      const response = await login({
        email,
        password,
      });

      if (response?.isSuccessful) {
        setSuccess(true);
      }

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

  const onForgotPassword = useCallback(async () => {
    if (!validation.success) {
      validation.showAllError();
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({
        email,
      });
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
          <DialogTitle>
            {mode === "forgotPassword" ? "Forgot password" : "Login"}
          </DialogTitle>
          {mode === "forgotPassword" ? (
            <DialogDescription>Lets get you reset link!</DialogDescription>
          ) : (
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-start">
            <Label htmlFor="email" className="text-right mb-4">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onBlur={(ev) =>
                ev.target.value ? validation.showError(ev.target.id) : null
              }
              onChange={(ev) => setEmail(ev.target.value)}
              className="col-span-3 text-black mb-2"
            />
            <span className="text-sm text-red-400">
              {validation.errors["email"]}
            </span>
          </div>
          {mode === "forgotPassword" ? null : (
            <div className="flex flex-col items-start">
              <Label htmlFor="password" className="text-right mb-4">
                Password
              </Label>
              <Input
                id="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                onBlur={(ev) =>
                  ev.target.value ? validation.showError(ev.target.id) : null
                }
                type="password"
                className="col-span-3 text-black mb-2"
              />
              <span className="text-sm text-red-400">
                {validation.errors["password"]}
              </span>
            </div>
          )}
          {failed ? (
            <div className="px-4 py-2 bg-red-900 border border-red-500 text-xs rounded-lg font-semibold">
              Incorrect username or password
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() =>
              setMode((state) =>
                state === "forgotPassword" ? "login" : "forgotPassword"
              )
            }
          >
            {mode === "forgotPassword" ? "Login" : "Forgot password"}
          </Button>
          <Button disabled={loading || success} onClick={onLogin}>
            {loading ? <Spinner size={8} /> : null}
            {success ? (
              <CheckIcon />
            ) : mode === "forgotPassword" ? (
              "Send link"
            ) : (
              "Login"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
