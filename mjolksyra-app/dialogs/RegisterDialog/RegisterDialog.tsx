"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
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
import { z } from "zod";
import { register } from "@/api/auth/register";
import { useAuth } from "@/context/Auth";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

const passwordSchema = z
  .string()
  .min(6, { message: "At least 6 characters" })
  .max(20, { message: "Maximum of 20 characters" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "At least 1 uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "At least 1 lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "At least 1 digit letter",
  });

const schema = z
  .object({
    givenName: z
      .string()
      .min(2, { message: "Given name must be at least 3 characters" }),
    familyName: z
      .string()
      .min(2, { message: "Family name must be at least 3 characters" }),
    email: z.string().email({ message: "Must be a valid email" }),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password mismatch against confirm password",
    path: ["confirmPassword"],
  });

type FieldProps = {
  id: string;
  value: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
  onChange: (_: string) => void;
};

type Props = {
  trigger: ReactNode;
};
export function RegisterDialog({ trigger }: Props) {
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const auth = useAuth();
  const parsed = useMemo(
    () =>
      schema.safeParse({
        givenName,
        familyName,
        email,
        password,
        confirmPassword,
      }),
    [givenName, familyName, email, password, confirmPassword]
  );

  const renderField = useCallback(
    ({
      id,
      value,
      onChange,
      label,
      type,
      autoComplete,
      placeholder,
    }: FieldProps) => (
      <div className="flex flex-col items-start gap-4">
        <Label htmlFor={id} className="text-right">
          {label}
        </Label>
        <Input
          id={id}
          value={value}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(ev) => onChange(ev.target.value)}
          className="col-span-3"
        />
      </div>
    ),
    []
  );

  const onSubmit = useCallback(async () => {
    if (!parsed.success) {
      return; // Show all errors
    }

    setLoading(true);
    const response = await register(parsed.data);
    setLoading(false);
    if (!response?.isSuccessful) {
      return;
    }

    auth.login(response);
    router.push("/planner");
  }, [auth, parsed.data, parsed.success, router]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register</DialogTitle>
          <DialogDescription>
            Get started today, no upfront costs!
          </DialogDescription>
        </DialogHeader>
        <form>
          <div className="grid gap-4 py-4">
            {renderField({
              id: "givenName",
              label: "Given name",
              value: givenName,
              autoComplete: "given-name",
              placeholder: "e.g., Anna",
              onChange: setGivenName,
              type: "text",
            })}
            {renderField({
              id: "familyName",
              label: "Family name",
              placeholder: "e.g., Andersson",
              value: familyName,
              autoComplete: "family-name",
              onChange: setFamilyName,
              type: "text",
            })}
            {renderField({
              id: "email",
              label: "Email",
              value: email,
              placeholder: "e.g., anna.andersson@gmail.com",
              autoComplete: "email",
              onChange: setEmail,
              type: "text",
            })}
            {renderField({
              id: "password",
              label: "Password",
              value: password,
              placeholder: "Choose a new password",
              autoComplete: "new-password",
              onChange: setPassword,
              type: "password",
            })}
            {renderField({
              id: "confirmPassword",
              label: "Confirm password",
              placeholder: "Repeat choosen password",
              value: confirmPassword,
              autoComplete: "new-password",
              onChange: setConfirmPassword,
              type: "password",
            })}
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} onClick={onSubmit}>
            {loading ? <Spinner size={8} /> : null}
            Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
